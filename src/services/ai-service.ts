import type { ModelConfig } from "../types";
import {
	canMakeRequest,
	getDelayBeforeNextRequest,
	recordRequest,
	waitForRateLimit,
} from "./rate-limiter";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SYSTEM_PROMPT = `You are a Linux Server Administrator working in a Docker container environment.
You will receive a task.
Output ONLY a raw JSON array of bash strings commands to execute.
Do not output markdown code blocks.
Do not output explanations.
Important: This is a Docker container, so systemctl commands won't work. Use service commands or direct binary execution instead.
Example: ["apt-get update", "apt-get install -y nginx", "service nginx start"]`;

export interface AIResponse {
	commands: string[];
	rawResponse: string;
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	baseDelay = 1000
): Promise<T> {
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			const errorMessage = String(error);
			const isRateLimit =
				errorMessage.includes("429") || errorMessage.includes("rate");

			if (isRateLimit && attempt < maxRetries - 1) {
				const delay = baseDelay * 2 ** attempt;
				const retryAfter = errorMessage.match(/retry.*?(\d+)/i);
				const waitTime = retryAfter
					? Number.parseInt(retryAfter[1], 10) * 1000
					: delay;

				console.log(
					`⏳ Rate limited, retrying in ${Math.ceil(waitTime / 1000)}s... (attempt ${attempt + 1}/${maxRetries})`
				);
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				continue;
			}

			throw error;
		}
	}

	throw new Error("Max retries exceeded");
}

/**
 * Get commands from AI model via OpenRouter
 */
export async function getAICommands(
	prompt: string,
	model: ModelConfig,
	apiKey: string
): Promise<AIResponse> {
	console.log(`🤖 Asking ${model.name} (${model.id})...`);

	// Wait for rate limit if needed
	await waitForRateLimit();

	return retryWithBackoff(async () => {
		if (!canMakeRequest()) {
			const delay = getDelayBeforeNextRequest();
			const seconds = Math.ceil(delay / 1000);
			throw new Error(
				`Rate limit reached. Please wait ${seconds}s or adjust rate limit configuration.`
			);
		}

		const response = await fetch(OPENROUTER_API_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
				"HTTP-Referer": "https://github.com/thiqah/thiqah-ops",
				"X-Title": "ThiqahOps Benchmark",
			},
			body: JSON.stringify({
				model: model.id,
				messages: [
					{ role: "system", content: SYSTEM_PROMPT },
					{ role: "user", content: prompt },
				],
				temperature: 0.1, // Lower temperature for more deterministic responses
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			// Don't record request on error
			if (response.status === 429) {
				throw new Error(
					`OpenRouter API error: ${response.status} - ${errorText}`
				);
			}
			throw new Error(
				`OpenRouter API error: ${response.status} - ${errorText}`
			);
		}

		// Record successful request
		recordRequest();

		const data = (await response.json()) as {
			choices: Array<{ message: { content: string } }>;
		};
		const rawContent = data.choices[0]?.message?.content || "";

		try {
			// Clean up markdown code blocks if present
			let cleaned = rawContent.trim();
			cleaned = cleaned
				.replace(/```json\s*/g, "")
				.replace(/```\s*/g, "")
				.trim();

			// Try to extract JSON array from response
			const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
			if (jsonMatch) {
				cleaned = jsonMatch[0];
			}

			const commands = JSON.parse(cleaned);

			if (!Array.isArray(commands)) {
				throw new Error("Response is not an array");
			}

			// Ensure all commands are strings
			return {
				commands: commands.map((cmd) => String(cmd)),
				rawResponse: rawContent,
			};
		} catch (e) {
			console.error("❌ Failed to parse AI response:", rawContent);
			console.error("Parse error:", e);
			return {
				commands: [],
				rawResponse: rawContent,
			};
		}
	});
}

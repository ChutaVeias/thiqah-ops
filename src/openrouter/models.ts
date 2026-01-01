import type { ModelConfig } from "../types";
import {
	fetchCombinedOpenRouterModels,
	fetchPublicApiOpenRouterModels,
} from "./client";
import type { CombinedOpenRouterModel } from "./types";

/**
 * Determine if a model is free or paid based on pricing
 */
function determineTier(
	promptPrice: string,
	completionPrice: string
): "free" | "paid" {
	const prompt = Number.parseFloat(promptPrice) || 0;
	const completion = Number.parseFloat(completionPrice) || 0;

	// If both prices are 0, it's free
	if (prompt === 0 && completion === 0) {
		return "free";
	}

	return "paid";
}

/**
 * Extract provider name from model data
 * Falls back to extracting from model ID if author/endpoint not available
 */
function extractProvider(
	modelId: string,
	author?: string,
	endpointName?: string
): string {
	// First try author
	if (author) {
		// Common provider mappings
		if (author.includes("Meta") || author.includes("Llama")) {
			return "Meta";
		}
		if (author.includes("Anthropic") || author.includes("Claude")) {
			return "Anthropic";
		}
		if (author.includes("OpenAI") || author.includes("GPT")) {
			return "OpenAI";
		}
		if (author.includes("Google") || author.includes("Gemini")) {
			return "Google";
		}
		if (author.includes("Mistral")) {
			return "Mistral AI";
		}
		if (author.includes("Qwen")) {
			return "Qwen";
		}

		// Return first part of author name or full author
		return author.split("/")[0] || author;
	}

	// Try endpoint name
	if (endpointName) {
		const parts = endpointName.split("/");
		if (parts.length > 0) {
			return parts[0];
		}
	}

	// Fallback: extract from model ID (format: "provider/model-name")
	const idParts = modelId.split("/");
	if (idParts.length > 0) {
		const providerPart = idParts[0];

		// Map common provider IDs to readable names
		const providerMap: Record<string, string> = {
			"meta-llama": "Meta",
			anthropic: "Anthropic",
			openai: "OpenAI",
			google: "Google",
			mistralai: "Mistral AI",
			qwen: "Qwen",
		};

		return providerMap[providerPart] || providerPart;
	}

	return "Unknown";
}

/**
 * Map OpenRouter model to ModelConfig
 */
function mapToModelConfig(model: CombinedOpenRouterModel): ModelConfig {
	const tier = determineTier(model.pricing.prompt, model.pricing.completion);
	const provider = extractProvider(
		model.id,
		model.author,
		model.endpoint?.name
	);

	return {
		id: model.id,
		name: model.name,
		tier,
		provider,
	};
}

/**
 * Check if a model ID has the :free suffix (indicating it's a free model)
 */
function isFreeModel(modelId: string): boolean {
	return modelId.endsWith(":free");
}

/**
 * Fetch and filter models from OpenRouter API
 * @param apiKey - OpenRouter API key
 * @param filter - Filter by tier: 'free' (models with :free suffix), 'paid', or 'all'
 * @param options - Optional configuration
 * @param options.quick - If true, fetch top-weekly models and limit to 3
 * @returns Array of ModelConfig matching the filter
 */
export async function getModels(
	apiKey: string,
	filter: "free" | "paid" | "all" = "free",
	options?: { quick?: boolean }
): Promise<ModelConfig[]> {
	try {
		let openRouterModels: CombinedOpenRouterModel[];

		if (options?.quick) {
			// Use combined API with top-weekly ordering for quick mode
			const combinedResponse = await fetchCombinedOpenRouterModels(apiKey, {
				order: "top-weekly",
			});
			openRouterModels = combinedResponse.models;
		} else {
			// Use public API for normal mode
			openRouterModels = await fetchPublicApiOpenRouterModels(apiKey);
		}

		// Map to ModelConfig format
		let models = openRouterModels.map(mapToModelConfig);

		// Filter by tier if needed
		if (filter === "all") {
			// In quick mode, limit to top 3
			if (options?.quick) {
				models = models.slice(0, 3);
			}
			return models;
		}

		if (filter === "free") {
			// Filter by :free suffix in model ID (more accurate than pricing-based)
			models = models.filter((m) => isFreeModel(m.id));
		} else {
			// For paid, exclude free models (those with :free suffix)
			models = models.filter((m) => !isFreeModel(m.id));
		}

		// In quick mode, limit to top 3 after filtering
		if (options?.quick) {
			models = models.slice(0, 3);
		}

		return models;
	} catch (error) {
		console.error("Failed to fetch models from OpenRouter:", error);
		// Return empty array on error
		return [];
	}
}

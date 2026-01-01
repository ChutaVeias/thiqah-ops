import { evaluateScenario } from "./evaluator";
import { getAICommands } from "./services/ai-service";
import {
	DockerManager,
	generateContainerName,
} from "./services/docker-manager";
import type { BenchmarkResult, ModelConfig, Scenario } from "./types";

export interface BenchmarkOptions {
	model: ModelConfig;
	scenario: Scenario;
	apiKey: string;
}

/**
 * Run a single benchmark: scenario + model combination
 */
export async function runBenchmark(
	options: BenchmarkOptions
): Promise<BenchmarkResult> {
	const { model, scenario, apiKey } = options;
	const containerName = generateContainerName(
		`thiqah-${scenario.id}-${model.id}`
	);
	const container = new DockerManager(containerName);

	try {
		// Start container
		await container.start();

		// Get commands from AI
		const aiResponse = await getAICommands(scenario.goalPrompt, model, apiKey);

		if (aiResponse.commands.length === 0) {
			throw new Error("AI returned no commands");
		}

		console.log(`📝 AI proposed ${aiResponse.commands.length} command(s)`);

		// Evaluate scenario
		const result = await evaluateScenario(
			scenario,
			aiResponse.commands,
			container
		);

		return {
			...result,
			model: model.id,
		};
	} catch (error) {
		console.error(`❌ Benchmark failed: ${String(error)}`);
		throw error;
	} finally {
		// Always cleanup
		await container.cleanup().catch((err) => {
			console.error(`⚠️  Cleanup error: ${String(err)}`);
		});
	}
}

/**
 * Run multiple benchmarks
 */
export async function runBenchmarks(
	models: ModelConfig[],
	scenarios: Scenario[],
	apiKey: string
): Promise<BenchmarkResult[]> {
	const results: BenchmarkResult[] = [];

	for (const model of models) {
		console.log(`\n${"=".repeat(60)}`);
		console.log(`🔬 Testing Model: ${model.name} (${model.id})`);
		console.log(`${"=".repeat(60)}`);

		for (const scenario of scenarios) {
			console.log(
				`\n--- Scenario: ${scenario.name} (${scenario.difficulty}) ---`
			);

			try {
				const result = await runBenchmark({ model, scenario, apiKey });
				results.push(result);

				const tier =
					result.score >= 95
						? "Mutmainnah"
						: result.score >= 80
							? "Musyrif"
							: "Muta'allim";
				console.log(`\n📊 Score: ${result.score.toFixed(1)}% (${tier})`);
			} catch (error) {
				console.error(`Failed to run benchmark: ${String(error)}`);
				// Continue with next scenario
			}
		}
	}

	return results;
}

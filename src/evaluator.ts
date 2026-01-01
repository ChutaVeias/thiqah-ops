import { filterCommands } from "./security/guardrails";
import type { DockerManager } from "./services/docker-manager";
import type {
	BenchmarkResult,
	Scenario,
	Validation,
	ValidationResult,
} from "./types";

/**
 * Run a scenario against a Docker container and evaluate results
 */
export async function evaluateScenario(
	scenario: Scenario,
	commands: string[],
	container: DockerManager
): Promise<BenchmarkResult> {
	const startTime = Date.now();
	const errors: string[] = [];

	// Filter dangerous commands
	const { safe, blocked } = filterCommands(commands);
	if (blocked.length > 0) {
		errors.push(`Blocked ${blocked.length} dangerous command(s)`);
		console.warn(`⚠️  Blocked commands: ${blocked.join(", ")}`);
	}

	// Execute commands
	console.log(`🚀 Executing ${safe.length} command(s)...`);
	const executionResults: boolean[] = [];

	for (const cmd of safe) {
		try {
			const success = await container.exec(cmd);
			executionResults.push(success);
			if (!success) {
				errors.push(`Command failed: ${cmd}`);
			}
		} catch (error) {
			errors.push(`Command error: ${cmd} - ${String(error)}`);
			executionResults.push(false);
		}
	}

	// Run validations
	console.log("🔍 Verifying State...");
	const validationResults: ValidationResult[] = [];

	for (const validation of scenario.validations) {
		try {
			const output = await container.execOutput(validation.checkCommand);
			const passed = checkValidation(output, validation);

			validationResults.push({
				description: validation.description,
				passed,
				expected: String(validation.expectedOutput),
				actual: output,
				scoreWeight: validation.scoreWeight,
			});

			const status = passed ? "✅" : "❌";
			console.log(
				`   ${status} [${passed ? "PASS" : "FAIL"}] ${validation.description}`
			);
			if (!passed) {
				console.log(`      Expected: ${validation.expectedOutput}`);
				console.log(
					`      Got: "${output.substring(0, 100)}${output.length > 100 ? "..." : ""}"`
				);
			}
		} catch (error) {
			validationResults.push({
				description: validation.description,
				passed: false,
				expected: String(validation.expectedOutput),
				actual: `Error: ${String(error)}`,
				scoreWeight: validation.scoreWeight,
			});
			console.log(`   ❌ [ERROR] ${validation.description}: ${String(error)}`);
		}
	}

	// Calculate score
	const totalWeight = validationResults.reduce(
		(sum, v) => sum + v.scoreWeight,
		0
	);
	const passedWeight = validationResults
		.filter((v) => v.passed)
		.reduce((sum, v) => sum + v.scoreWeight, 0);

	const score = totalWeight > 0 ? (passedWeight / totalWeight) * 100 : 0;

	// Check if critical validations passed
	const criticalFailed = scenario.validations.some(
		(v, i) => v.critical && !validationResults[i].passed
	);

	const passed = score >= 80 && !criticalFailed;

	const executionTime = Date.now() - startTime;

	return {
		scenarioId: scenario.id,
		scenarioName: scenario.name,
		score,
		maxScore: 100,
		passed,
		validations: validationResults,
		commandsExecuted: safe,
		executionTime,
		errors: errors.length > 0 ? errors : undefined,
	};
}

/**
 * Check if validation output matches expected pattern
 */
function checkValidation(output: string, validation: Validation): boolean {
	const expected = validation.expectedOutput;

	if (typeof expected === "string") {
		return output.includes(expected);
	}

	if (expected instanceof RegExp) {
		return expected.test(output);
	}

	return false;
}

import type { Scenario } from "../types";

/**
 * Get scenarios by difficulty
 */
export function getScenariosByDifficulty(
	difficulty?: "easy" | "medium" | "hard",
	scenarios: Scenario[] = []
): Scenario[] {
	if (!difficulty) {
		return scenarios;
	}
	return scenarios.filter((s) => s.difficulty === difficulty);
}

/**
 * Get scenario by ID
 */
export function getScenarioById(
	id: string,
	scenarios: Scenario[] = []
): Scenario | undefined {
	return scenarios.find((s) => s.id === id);
}

/**
 * Get scenarios by category
 */
export function getScenariosByCategory(
	category: Scenario["category"],
	scenarios: Scenario[] = []
): Scenario[] {
	return scenarios.filter((s) => s.category === category);
}

/**
 * Get scenarios by tag
 */
export function getScenariosByTag(
	tag: string,
	scenarios: Scenario[] = []
): Scenario[] {
	return scenarios.filter((s) => s.tags.includes(tag));
}

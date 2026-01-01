export type ScenarioCategory =
	| "setup"
	| "security"
	| "networking"
	| "service-management"
	| "file-operations"
	| "monitoring"
	| "backup"
	| "package-management"
	| "system-config"
	| "troubleshooting"
	| "text-processing";

export interface Scenario {
	id: string;
	name: string;
	description: string;
	category: ScenarioCategory;
	tags: string[]; // Additional tags for filtering/searching
	/**
	 * TODO: In my (@ImBIOS) opinion It's stupid approach of difficulty, more standardized approach is needed
	 */
	difficulty: "easy" | "medium" | "hard";
	initialState?: string; // Dockerfile setup commands (optional pre-setup)
	goalPrompt: string; // Task description sent to AI
	validations: Validation[];
}

export interface Validation {
	description: string;
	checkCommand: string; // Command to run inside Docker to verify state
	expectedOutput: RegExp | string; // Regex match or exact string
	scoreWeight: number; // Weight for scoring (default 1.0)
	critical?: boolean; // If true, failure means scenario fails
}

export interface BenchmarkResult {
	model: string;
	scenarioId: string;
	scenarioName: string;
	score: number;
	maxScore: number;
	passed: boolean;
	validations: ValidationResult[];
	commandsExecuted: string[];
	executionTime: number;
	errors?: string[];
}

export interface ValidationResult {
	description: string;
	passed: boolean;
	expected: string;
	actual: string;
	scoreWeight: number;
}

export interface ModelConfig {
	name: string;
	id: string;
	tier: "free" | "paid";
	provider: string;
}

export type ModelFilter = "free" | "paid" | "all";

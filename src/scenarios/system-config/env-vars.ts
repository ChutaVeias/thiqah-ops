import type { Scenario } from "../../types";

export const envVars: Scenario = {
	id: "env-vars",
	name: "System Config: Set Persistent Environment Variable",
	description: "Set environment variable for all users in /etc/environment",
	category: "system-config",
	tags: ["environment", "system-config", "variables"],
	difficulty: "easy",
	goalPrompt:
		"Set a persistent environment variable 'APP_ENV=production' for all users (e.g., in /etc/environment).",
	validations: [
		{
			description: "Environment variable is set",
			checkCommand: "grep 'APP_ENV=production' /etc/environment",
			expectedOutput: /APP_ENV=production/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

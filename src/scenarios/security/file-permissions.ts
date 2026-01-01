import type { Scenario } from "../../types";

export const filePermissions: Scenario = {
	id: "file-permissions",
	name: "Security: Set Proper File Permissions",
	description: "Create a sensitive file with secure permissions (not 777)",
	category: "security",
	tags: ["permissions", "chmod", "file-security"],
	difficulty: "easy",
	goalPrompt:
		"Create a file '/secret/config.json'. It should be owned by 'root' and only readable by 'root' (600 or 400).",
	validations: [
		{
			description: "Config file exists",
			checkCommand: "test -f /secret/config.json && echo 'exists'",
			expectedOutput: /exists/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "File permissions and owner are correct",
			checkCommand: "stat -c '%a %U' /secret/config.json",
			expectedOutput: /(600|400)\s+root/,
			scoreWeight: 2.0,
			critical: true,
		},
	],
};

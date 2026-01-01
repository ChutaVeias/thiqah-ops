import type { Scenario } from "../../types";

export const symlinkSetup: Scenario = {
	id: "symlink-setup",
	name: "File Operations: Create Symbolic Link",
	description: "Create a symbolic link for version management",
	category: "file-operations",
	tags: ["symlink", "ln", "file-management"],
	difficulty: "easy",
	initialState: "mkdir -p /var/www/release-v1",
	goalPrompt:
		"Create a symbolic link named /var/www/current pointing to /var/www/release-v1.",
	validations: [
		{
			description: "Symbolic link exists and points correctly",
			checkCommand: "ls -l /var/www/current",
			expectedOutput: /->\s+\/var\/www\/release-v1/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

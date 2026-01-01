import type { Scenario } from "../../types";

export const installGit: Scenario = {
	id: "install-git",
	name: "Package Management: Install and Configure Git",
	description: "Install git and configure global user name",
	category: "package-management",
	tags: ["git", "version-control", "tooling"],
	difficulty: "easy",
	goalPrompt: "Install git and configure the global user.name to 'Thiqah Bot'.",
	validations: [
		{
			description: "Git is installed",
			checkCommand: "which git",
			expectedOutput: /git/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Global user.name is configured",
			checkCommand: "git config --global user.name",
			expectedOutput: /Thiqah Bot/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

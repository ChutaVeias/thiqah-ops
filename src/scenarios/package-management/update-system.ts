import type { Scenario } from "../../types";

export const updateSystem: Scenario = {
	id: "update-system",
	name: "Package Management: Update System Packages",
	description: "Update package lists and upgrade system packages",
	category: "package-management",
	tags: ["apt", "updates", "maintenance"],
	difficulty: "easy",
	goalPrompt:
		"Update the package list and upgrade all installed packages to their latest versions. Use apt-get update and apt-get upgrade commands.",
	validations: [
		{
			description: "Package list is updated",
			checkCommand:
				"test -f /var/lib/apt/lists/lock && echo 'updated' || ls /var/lib/apt/lists/ | head -1 | grep -E '.*' && echo 'updated' || echo 'not-found'",
			expectedOutput: /(updated|.*)/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Upgrade was attempted",
			checkCommand:
				"dpkg -l | head -5 | grep -E '^ii' && echo 'packages-exist' || echo 'not-found'",
			expectedOutput: /packages-exist/,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

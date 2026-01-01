import type { Scenario } from "../../types";

export const diskUsage: Scenario = {
	id: "disk-usage",
	name: "Monitoring: Check and Alert on Disk Usage",
	description: "Create a script to monitor disk usage",
	category: "monitoring",
	tags: ["monitoring", "disk", "df"],
	difficulty: "easy",
	goalPrompt:
		"Write a script /check_disk.sh that prints 'WARNING' if disk usage on / is > 80%.",
	validations: [
		{
			description: "Script exists",
			checkCommand: "test -f /check_disk.sh && echo 'exists'",
			expectedOutput: /exists/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Script checks disk usage with 80% threshold",
			checkCommand: "grep '80' /check_disk.sh || echo 'not-found'",
			expectedOutput: /80/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

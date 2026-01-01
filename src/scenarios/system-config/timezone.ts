import type { Scenario } from "../../types";

export const timezone: Scenario = {
	id: "timezone",
	name: "System Config: Set Timezone",
	description: "Configure system timezone",
	category: "system-config",
	tags: ["timezone", "system-config", "localization"],
	difficulty: "easy",
	goalPrompt:
		"Set the system timezone to Asia/Jakarta. Use timedatectl if available, otherwise use traditional methods.",
	validations: [
		{
			description: "Timezone is set to Asia/Jakarta",
			checkCommand:
				"timedatectl 2>/dev/null | grep 'Asia/Jakarta' || cat /etc/timezone 2>/dev/null | grep 'Asia/Jakarta' || date +%Z 2>/dev/null | grep -E 'WIB|JKT' || echo 'not-found'",
			expectedOutput: /(Asia\/Jakarta|WIB|JKT)/i,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

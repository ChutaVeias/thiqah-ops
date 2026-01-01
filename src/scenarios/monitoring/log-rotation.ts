import type { Scenario } from "../../types";

export const logRotation: Scenario = {
	id: "log-rotation",
	name: "Monitoring: Configure Log Rotation",
	description: "Set up logrotate for application logs",
	category: "monitoring",
	tags: ["logging", "logrotate", "maintenance"],
	difficulty: "medium",
	goalPrompt:
		"Configure logrotate to rotate /var/log/myapp.log daily, keep 7 days of logs, compress old logs, and create new empty log file after rotation.",
	validations: [
		{
			description: "Logrotate config exists",
			checkCommand:
				"test -f /etc/logrotate.d/myapp && echo 'exists' || ls /etc/logrotate.d/ | grep myapp || echo 'not-found'",
			expectedOutput: /(exists|myapp)/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Daily rotation is configured",
			checkCommand:
				"grep -E 'daily|rotate.*7' /etc/logrotate.d/myapp 2>/dev/null || echo 'not-found'",
			expectedOutput: /(daily|rotate\s+7)/i,
			scoreWeight: 1.0,
			critical: false,
		},
		{
			description: "Compression is enabled",
			checkCommand:
				"grep -E 'compress|notifempty' /etc/logrotate.d/myapp 2>/dev/null || echo 'not-found'",
			expectedOutput: /compress/i,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

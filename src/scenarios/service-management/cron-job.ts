import type { Scenario } from "../../types";

export const cronJob: Scenario = {
	id: "cron-job",
	name: "Service Management: Create Cron Job",
	description: "Set up a scheduled task using cron",
	category: "service-management",
	tags: ["cron", "scheduling", "automation"],
	difficulty: "medium",
	goalPrompt:
		"Create a cron job that runs 'echo backup' >> /var/log/backup.log every day at 2:00 AM.",
	validations: [
		{
			description: "Cron job exists with correct command",
			checkCommand:
				"crontab -l 2>/dev/null | grep 'echo.*backup' || echo 'not-found'",
			expectedOutput: /echo.*backup/i,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Cron job has correct schedule (2 AM daily)",
			checkCommand:
				"crontab -l 2>/dev/null | grep -E '0\\s+2\\s+\\*\\s+\\*\\s+\\*.*echo.*backup' || echo 'not-found'",
			expectedOutput: /0\s+2\s+\*\s+\*\s+\*/,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

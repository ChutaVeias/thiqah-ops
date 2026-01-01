import type { Scenario } from "../../types";

export const backupScript: Scenario = {
	id: "backup-script",
	name: "File Operations: Create Backup Script",
	description: "Create a backup script with proper error handling",
	category: "file-operations",
	tags: ["backup", "scripting", "bash"],
	difficulty: "medium",
	goalPrompt:
		"Write a script /usr/local/bin/backup.sh that zips /var/www/html to /backup/www.zip.",
	validations: [
		{
			description: "Backup script exists and is executable",
			checkCommand:
				"test -f /usr/local/bin/backup.sh && test -x /usr/local/bin/backup.sh && echo 'exists'",
			expectedOutput: /exists/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Backup file is created after script execution",
			checkCommand:
				"/usr/local/bin/backup.sh 2>/dev/null && test -f /backup/www.zip && echo 'created' || echo 'not-found'",
			expectedOutput: /created/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

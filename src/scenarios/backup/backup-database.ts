import type { Scenario } from "../../types";

export const backupDatabase: Scenario = {
	id: "backup-database",
	name: "Backup: Create Database Backup",
	description: "Create a backup script for a database",
	category: "backup",
	tags: ["backup", "database", "mysql"],
	difficulty: "medium",
	goalPrompt: `Create a backup script that exports a MySQL database named 'myapp_db' to a file /backups/myapp_db_backup_$(date +%Y%m%d).sql. The script should handle the case where mysqldump might not be available (just create the script structure).`,
	validations: [
		{
			description: "Backup script exists",
			checkCommand:
				"test -f /usr/local/bin/backup-db.sh && echo 'exists' || ls /usr/local/bin/ | grep backup-db || echo 'not-found'",
			expectedOutput: /(exists|backup-db)/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Script references mysqldump",
			checkCommand:
				"grep -E 'mysqldump|mysql.*dump' /usr/local/bin/backup-db.sh 2>/dev/null || echo 'not-found'",
			expectedOutput: /mysqldump/i,
			scoreWeight: 1.5,
			critical: true,
		},
		{
			description: "Script uses date in filename",
			checkCommand:
				"grep -E 'date|\\$\\{date|%Y%m%d' /usr/local/bin/backup-db.sh 2>/dev/null || echo 'not-found'",
			expectedOutput: /(date|%Y%m%d)/,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

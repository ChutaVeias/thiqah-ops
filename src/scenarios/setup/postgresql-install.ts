import type { Scenario } from "../../types";

export const postgresqlInstall: Scenario = {
	id: "postgresql-install",
	name: "Setup: Install PostgreSQL",
	description: "Install and configure PostgreSQL database server",
	category: "setup",
	tags: ["database", "postgresql", "sql"],
	difficulty: "medium",
	goalPrompt:
		"Install PostgreSQL. Create a database named 'thiqah_db' and a user 'thiqah_user' with password 'securepass'.",
	validations: [
		{
			description: "PostgreSQL is installed",
			checkCommand: "which psql || which postgres",
			expectedOutput: /(psql|postgres)/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "PostgreSQL service is ready",
			checkCommand: "pg_isready 2>/dev/null || echo 'not-ready'",
			expectedOutput: /accepting connections/i,
			scoreWeight: 1.0,
			critical: false,
		},
		{
			description: "Database exists",
			checkCommand:
				"sudo -u postgres psql -l 2>/dev/null | grep thiqah_db || echo 'not-found'",
			expectedOutput: /thiqah_db/,
			scoreWeight: 1.5,
			critical: true,
		},
		{
			description: "User exists",
			checkCommand:
				"sudo -u postgres psql -c '\\du' 2>/dev/null | grep thiqah_user || echo 'not-found'",
			expectedOutput: /thiqah_user/,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

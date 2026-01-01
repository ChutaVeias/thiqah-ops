import type { Scenario } from "../../types";

export const fixPermissions: Scenario = {
	id: "fix-permissions",
	name: "Troubleshooting: Fix Permission Denied",
	description: "Fix file permissions so www-data can write to directory",
	category: "troubleshooting",
	tags: ["permissions", "troubleshooting", "chmod", "chown"],
	difficulty: "medium",
	initialState:
		"mkdir -p /var/www/html/uploads && chown root:root /var/www/html/uploads && chmod 755 /var/www/html/uploads",
	goalPrompt:
		"The user 'www-data' cannot write to /var/www/html/uploads. Fix the permissions so they can write.",
	validations: [
		{
			description: "www-data can write to directory",
			checkCommand:
				"sudo -u www-data touch /var/www/html/uploads/test 2>/dev/null && echo 'writable' || echo 'not-writable'",
			expectedOutput: /writable/,
			scoreWeight: 2.0,
			critical: true,
		},
	],
};

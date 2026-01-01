import type { Scenario } from "../../types";

export const systemdService: Scenario = {
	id: "systemd-service",
	name: "Service Management: Create Systemd Service",
	description: "Create a systemd service unit file",
	category: "service-management",
	tags: ["systemd", "service", "daemon"],
	difficulty: "hard",
	goalPrompt:
		"Create a systemd service file for a simple application. The service should run /usr/local/bin/myapp, start on boot, restart on failure, and log output to /var/log/myapp.log. Note: In Docker containers, systemd may not work, but the service file should still be created correctly.",
	validations: [
		{
			description: "Service file exists",
			checkCommand:
				"test -f /etc/systemd/system/myapp.service && echo 'exists' || echo 'not-found'",
			expectedOutput: /exists/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Service has ExecStart",
			checkCommand:
				"grep -E 'ExecStart\\s*=' /etc/systemd/system/myapp.service || echo 'not-found'",
			expectedOutput: /ExecStart/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Service is enabled on boot",
			checkCommand:
				"grep -E 'WantedBy\\s*=\\s*multi-user' /etc/systemd/system/myapp.service || echo 'not-found'",
			expectedOutput: /WantedBy.*multi-user/i,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

import type { Scenario } from "../../types";

export const sshHardening: Scenario = {
	id: "ssh-hardening",
	name: "Security: Harden SSH Configuration",
	description:
		"Configure SSH to disable root login and password authentication",
	category: "security",
	tags: ["ssh", "hardening", "authentication"],
	difficulty: "medium",
	goalPrompt:
		"Configure SSH to disable root login and disable password authentication (use key-based auth only). Edit /etc/ssh/sshd_config to set PermitRootLogin no and PasswordAuthentication no.",
	validations: [
		{
			description: "SSH config exists",
			checkCommand: "test -f /etc/ssh/sshd_config && echo 'exists'",
			expectedOutput: /exists/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Root login is disabled",
			checkCommand:
				"grep -E '^PermitRootLogin\\s+no' /etc/ssh/sshd_config || grep -E '^#PermitRootLogin\\s+no' /etc/ssh/sshd_config",
			expectedOutput: /PermitRootLogin.*no/i,
			scoreWeight: 1.5,
			critical: true,
		},
		{
			description: "Password authentication is disabled",
			checkCommand:
				"grep -E '^PasswordAuthentication\\s+no' /etc/ssh/sshd_config || grep -E '^#PasswordAuthentication\\s+no' /etc/ssh/sshd_config",
			expectedOutput: /PasswordAuthentication.*no/i,
			scoreWeight: 1.5,
			critical: false,
		},
	],
};

import type { Scenario } from "../../types";

export const fail2ban: Scenario = {
	id: "fail2ban",
	name: "Security: Install and Configure Fail2ban",
	description: "Install Fail2ban to protect against brute force attacks",
	category: "security",
	tags: ["fail2ban", "brute-force", "intrusion-detection"],
	difficulty: "hard",
	goalPrompt:
		"Install Fail2ban and configure it to protect SSH. Set up a jail for SSH that bans IPs after 3 failed login attempts for 1 hour.",
	validations: [
		{
			description: "Fail2ban is installed",
			checkCommand: "which fail2ban-client || which fail2ban-server",
			expectedOutput: /fail2ban/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "SSH jail is configured",
			checkCommand:
				"test -f /etc/fail2ban/jail.d/sshd.conf || grep -E '\\[sshd\\]' /etc/fail2ban/jail.local 2>/dev/null || grep -E '\\[sshd\\]' /etc/fail2ban/jail.conf 2>/dev/null || echo 'not-found'",
			expectedOutput: /(sshd|\[sshd\])/i,
			scoreWeight: 1.0,
			critical: false,
		},
		{
			description: "Max retry is set to 3",
			checkCommand:
				"grep -E 'maxretry\\s*=\\s*3' /etc/fail2ban/jail.d/sshd.conf 2>/dev/null || grep -E 'maxretry\\s*=\\s*3' /etc/fail2ban/jail.local 2>/dev/null || echo 'not-found'",
			expectedOutput: /maxretry.*3/i,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

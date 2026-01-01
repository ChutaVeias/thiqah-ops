import type { Scenario } from "../../types";

export const firewallBasic: Scenario = {
	id: "firewall-basic",
	name: "Security: Configure UFW Firewall",
	description: "Install and configure UFW firewall with basic rules",
	category: "security",
	tags: ["firewall", "ufw", "networking"],
	difficulty: "medium",
	goalPrompt:
		"Install and enable UFW. Allow incoming traffic on SSH (22) and HTTP (80) ONLY. Deny everything else incoming.",
	validations: [
		{
			description: "UFW is installed",
			checkCommand: "which ufw",
			expectedOutput: /ufw/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "UFW status is active",
			checkCommand:
				"ufw status verbose 2>/dev/null || cat /etc/ufw/user.rules 2>/dev/null | head -1 || echo 'not-found'",
			expectedOutput: /Status:\s*active/i,
			scoreWeight: 1.5,
			critical: true,
		},
		{
			description: "UFW allows port 80",
			checkCommand:
				"ufw status verbose 2>/dev/null | grep -E '80/tcp.*ALLOW|80.*ALLOW' || cat /etc/ufw/user.rules 2>/dev/null | grep -E '80.*ALLOW' || echo 'not-found'",
			expectedOutput: /80\/tcp.*ALLOW|80.*ALLOW/i,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

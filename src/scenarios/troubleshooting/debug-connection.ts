import type { Scenario } from "../../types";

export const debugConnection: Scenario = {
	id: "debug-connection",
	name: "Troubleshooting: Debug Network Connection",
	description: "Identify if connection issue is DNS or network related",
	category: "troubleshooting",
	tags: ["troubleshooting", "networking", "debugging", "dns"],
	difficulty: "hard",
	goalPrompt:
		"I cannot connect to https://www.google.com. Identify if it's a DNS issue or a connection issue. If ping works but curl fails, print 'FIREWALL'. If ping fails, print 'NETWORK'.",
	validations: [
		{
			description: "Script exists and performs connectivity check",
			checkCommand:
				"test -f /tmp/debug_connection.sh && /tmp/debug_connection.sh 2>/dev/null | grep -E '(FIREWALL|NETWORK)' || echo 'not-found'",
			expectedOutput: /(FIREWALL|NETWORK)/,
			scoreWeight: 1.5,
			critical: true,
		},
		{
			description: "Script uses ping and curl for diagnosis",
			checkCommand:
				"grep -E 'ping|curl' /tmp/debug_connection.sh 2>/dev/null || echo 'not-found'",
			expectedOutput: /(ping|curl)/i,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

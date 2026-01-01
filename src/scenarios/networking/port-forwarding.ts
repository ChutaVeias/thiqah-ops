import type { Scenario } from "../../types";

export const portForwarding: Scenario = {
	id: "port-forwarding",
	name: "Networking: Configure Port Forwarding",
	description: "Set up iptables port forwarding",
	category: "networking",
	tags: ["iptables", "port-forwarding", "networking"],
	difficulty: "hard",
	goalPrompt:
		"Configure iptables to forward traffic from port 8080 to port 80. This allows external access to a service running on port 80 via port 8080.",
	validations: [
		{
			description: "Port forwarding rule exists",
			checkCommand:
				"iptables -t nat -L PREROUTING 2>/dev/null | grep -E '8080.*80|DNAT.*8080' || iptables -t nat -L 2>/dev/null | grep -E '8080.*80' || echo 'not-found'",
			expectedOutput: /(8080|80|DNAT)/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

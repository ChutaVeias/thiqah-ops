import type { Scenario } from "../../types";

export const dnsCheck: Scenario = {
	id: "dns-check",
	name: "Networking: Configure DNS",
	description: "Configure the system to use Google DNS",
	category: "networking",
	tags: ["dns", "networking", "resolv.conf"],
	difficulty: "easy",
	goalPrompt:
		"Configure the system to use Google DNS (8.8.8.8) by adding it to /etc/resolv.conf.",
	validations: [
		{
			description: "Google DNS is configured",
			checkCommand: "cat /etc/resolv.conf | grep '8.8.8.8'",
			expectedOutput: /nameserver\s+8\.8\.8\.8/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

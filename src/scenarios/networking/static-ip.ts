import type { Scenario } from "../../types";

export const staticIp: Scenario = {
	id: "static-ip",
	name: "Networking: Configure Static IP",
	description: "Configure a static IP address for network interface",
	category: "networking",
	tags: ["networking", "ip-config", "netplan"],
	difficulty: "hard",
	goalPrompt:
		"Configure the primary network interface with a static IP address 192.168.1.100, netmask 255.255.255.0, gateway 192.168.1.1, and DNS server 8.8.8.8. Use netplan if available, otherwise use traditional ifconfig/ip commands.",
	validations: [
		{
			description: "Static IP is configured",
			checkCommand:
				"ip addr show | grep '192.168.1.100' || ifconfig 2>/dev/null | grep '192.168.1.100' || echo 'not-found'",
			expectedOutput: /192\.168\.1\.100/,
			scoreWeight: 1.5,
			critical: true,
		},
		{
			description: "Gateway is configured",
			checkCommand:
				"ip route | grep default | grep '192.168.1.1' || route -n 2>/dev/null | grep '192.168.1.1' || echo 'not-found'",
			expectedOutput: /192\.168\.1\.1/,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

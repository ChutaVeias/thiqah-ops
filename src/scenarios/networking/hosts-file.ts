import type { Scenario } from "../../types";

export const hostsFile: Scenario = {
	id: "hosts-file",
	name: "Networking: Configure Hosts File",
	description: "Map hostname to IP in /etc/hosts",
	category: "networking",
	tags: ["hosts", "dns", "networking"],
	difficulty: "easy",
	goalPrompt:
		"Map the hostname 'internal.api' to IP '10.0.0.5' in the /etc/hosts file.",
	validations: [
		{
			description: "Host mapping exists",
			checkCommand: "grep '10.0.0.5' /etc/hosts",
			expectedOutput: /10\.0\.0\.5.*internal\.api/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

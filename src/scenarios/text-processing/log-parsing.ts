import type { Scenario } from "../../types";

export const logParsing: Scenario = {
	id: "log-parsing",
	name: "Text Processing: Parse Log File",
	description: "Extract unique IP addresses from log file using grep/awk/sed",
	category: "text-processing",
	tags: ["grep", "awk", "sed", "log-analysis"],
	difficulty: "medium",
	initialState:
		"echo -e '192.168.1.1 GET\\n192.168.1.2 GET\\n192.168.1.1 POST' > /var/log/access.log",
	goalPrompt:
		"I have a log file at /var/log/access.log. Extract all unique IP addresses (first column) and save them to /var/log/unique_ips.txt.",
	validations: [
		{
			description: "Unique IPs file exists",
			checkCommand: "test -f /var/log/unique_ips.txt && echo 'exists'",
			expectedOutput: /exists/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "File contains 2 unique IPs",
			checkCommand: "wc -l /var/log/unique_ips.txt",
			expectedOutput: /^\s*2\s/,
			scoreWeight: 1.5,
			critical: true,
		},
		{
			description: "File contains 192.168.1.1",
			checkCommand: "cat /var/log/unique_ips.txt",
			expectedOutput: /192\.168\.1\.1/,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

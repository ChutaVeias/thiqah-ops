import type { Scenario } from "../../types";

export const processKill: Scenario = {
	id: "process-kill",
	name: "Service Management: Kill Process",
	description: "Find and kill a running process",
	category: "service-management",
	tags: ["process", "kill", "resource-control"],
	difficulty: "medium",
	initialState: "sleep 1000 &",
	goalPrompt:
		"There is a process named 'sleep 1000' running in the background. Find its PID and kill it.",
	validations: [
		{
			description: "Process is no longer running",
			checkCommand:
				"pgrep -f 'sleep 1000' && echo 'still-running' || echo 'killed'",
			expectedOutput: /killed/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

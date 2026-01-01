import type { Scenario } from "../../types";

export const findLargeFiles: Scenario = {
	id: "find-large-files",
	name: "File Operations: Find and Delete Large Files",
	description: "Find files larger than 1MB and delete them",
	category: "file-operations",
	tags: ["find", "disk-cleanup", "file-management"],
	difficulty: "medium",
	initialState:
		"dd if=/dev/zero of=/var/log/huge.log bs=1M count=2 2>/dev/null",
	goalPrompt: "Find all files in /var/log larger than 1MB and delete them.",
	validations: [
		{
			description: "Large file is deleted",
			checkCommand:
				"test -f /var/log/huge.log && echo 'exists' || echo 'deleted'",
			expectedOutput: /deleted/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

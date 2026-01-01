import type { Scenario } from "../../types";

export const userCreation: Scenario = {
	id: "user-creation",
	name: "Security: Create User with Sudo",
	description: "Create a new user and grant sudo access without password",
	category: "security",
	tags: ["user-management", "sudo", "permissions"],
	difficulty: "medium",
	goalPrompt:
		"Create a new user named 'gaza_admin'. Give them sudo access without password requirement.",
	validations: [
		{
			description: "User exists",
			checkCommand: "id gaza_admin",
			expectedOutput: /uid=/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "User has sudo NOPASSWD",
			checkCommand:
				"sudo -l -U gaza_admin 2>/dev/null | grep NOPASSWD || cat /etc/sudoers.d/* 2>/dev/null | grep gaza_admin",
			expectedOutput: /NOPASSWD/,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

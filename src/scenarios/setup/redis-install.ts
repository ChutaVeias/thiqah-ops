import type { Scenario } from "../../types";

export const redisInstall: Scenario = {
	id: "redis-install",
	name: "Setup: Install Redis",
	description:
		"Install Redis server and configure it to run on the default port",
	category: "setup",
	tags: ["redis", "cache", "database"],
	difficulty: "medium",
	goalPrompt:
		"Install Redis server and configure it to run on the default port. Ensure it answers to PING.",
	validations: [
		{
			description: "Redis is installed",
			checkCommand: "which redis-cli || which redis-server",
			expectedOutput: /redis/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Redis responds to PING",
			checkCommand:
				"redis-cli ping 2>/dev/null || service redis-server start 2>/dev/null && sleep 1 && redis-cli ping 2>/dev/null || echo 'not-found'",
			expectedOutput: /PONG/i,
			scoreWeight: 1.5,
			critical: true,
		},
	],
};

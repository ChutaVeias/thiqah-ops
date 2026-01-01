import type { Scenario } from "../../types";

export const dockerInstall: Scenario = {
	id: "docker-install",
	name: "Install Docker",
	description: "Install Docker Engine on Ubuntu",
	category: "setup",
	tags: ["docker", "containerization", "package-management"],
	difficulty: "hard",
	goalPrompt:
		"Install Docker Engine on this Ubuntu server. Include the official Docker repository and install the latest stable version. Note: We're in a Docker container, so the Docker daemon won't be able to run, but the installation should still succeed.",
	validations: [
		{
			description: "Docker is installed",
			checkCommand: "which docker",
			expectedOutput: /docker/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Docker version can be checked",
			checkCommand: "docker --version 2>&1",
			expectedOutput: /docker|Docker/i,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

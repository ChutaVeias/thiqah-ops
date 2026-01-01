import type { Scenario } from "../../types";

export const nginxInstall: Scenario = {
	id: "nginx-install",
	name: "Install & Configure Nginx",
	description: "Install Nginx, enable boot start, create custom index",
	category: "setup",
	tags: ["web-server", "nginx", "http"],
	difficulty: "easy",
	goalPrompt:
		"Install Nginx on this server. Ensure it is enabled to start on boot. Create an index.html file in the default web root with the content 'Welcome to ThiqahOps'. Note: This is a Docker container, so systemctl may not work - use service commands or direct execution.",
	validations: [
		{
			description: "Nginx binary exists",
			checkCommand: "which nginx || which /usr/sbin/nginx",
			expectedOutput: /(\/usr\/sbin\/nginx|\/usr\/bin\/nginx)/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Service is enabled (or nginx is running)",
			checkCommand:
				"systemctl is-enabled nginx 2>/dev/null || service nginx status 2>/dev/null | grep -E 'running|active' || pgrep nginx && echo 'enabled' || echo 'not-found'",
			expectedOutput: /(enabled|running|active)/i,
			scoreWeight: 1.0,
			critical: false,
		},
		{
			description: "Index.html content is correct",
			checkCommand:
				"curl -s localhost 2>/dev/null || cat /var/www/html/index.html",
			expectedOutput: /Welcome to ThiqahOps/,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

import type { Scenario } from "../../types";

export const sslCertificate: Scenario = {
	id: "ssl-certificate",
	name: "Security: Generate SSL Certificate",
	description: "Generate a self-signed SSL certificate",
	category: "security",
	tags: ["ssl", "tls", "certificate", "encryption"],
	difficulty: "medium",
	goalPrompt: `Generate a self-signed SSL certificate for domain 'example.com'. Save the certificate to /etc/ssl/certs/example.com.crt and the private key to /etc/ssl/private/example.com.key. Use openssl to generate the certificate.`,
	validations: [
		{
			description: "Certificate file exists",
			checkCommand: "test -f /etc/ssl/certs/example.com.crt && echo 'exists'",
			expectedOutput: /exists/,
			scoreWeight: 1.0,
			critical: true,
		},
		{
			description: "Private key exists",
			checkCommand: "test -f /etc/ssl/private/example.com.key && echo 'exists'",
			expectedOutput: /exists/,
			scoreWeight: 1.5,
			critical: true,
		},
		{
			description: "Certificate is valid",
			checkCommand:
				"openssl x509 -in /etc/ssl/certs/example.com.crt -text -noout 2>/dev/null | head -5 | grep -E 'Certificate|Issuer' || echo 'not-found'",
			expectedOutput: /(Certificate|Issuer)/,
			scoreWeight: 1.0,
			critical: false,
		},
	],
};

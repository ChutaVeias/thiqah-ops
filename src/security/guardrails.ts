/**
 * Security Guardrails
 * Blocks dangerous commands before execution in Docker
 */

const DANGEROUS_PATTERNS = [
	// Fork bombs
	/:\(\s*\)\s*\{[^}]*:\s*\|\s*:[^}]*\}/,

	// Dangerous rm commands (outside safe contexts)
	/rm\s+-rf\s+\/\s*$/,
	/rm\s+-rf\s+\/usr/,
	/rm\s+-rf\s+\/etc/,
	/rm\s+-rf\s+\/var\/lib/,

	// Format/wipe commands
	/mkfs\.|dd\s+if=.*of=.*\/dev/,

	// Network abuse (if running offline tests)
	/curl.*http:\/\/\d+\.\d+\.\d+\.\d+/,
	/wget.*http:\/\/\d+\.\d+\.\d+\.\d+/,

	// System manipulation that could affect host
	/mount.*\/dev/,
	/umount.*\/sys/,

	// Disable security features
	/iptables.*-F|ufw.*disable/,
];

const SAFE_PATTERNS = [
	// Safe rm in tmp directories
	/rm\s+-rf\s+\/tmp\//,
	/rm\s+-rf\s+\/var\/tmp\//,
	// Safe apt clean (common in Docker)
	/apt-get\s+clean/,
	/apt-get\s+autoremove/,
];

/**
 * Check if a command is safe to execute
 * @param command - The command to check
 * @returns true if safe, false if dangerous
 */
export function isCommandSafe(command: string): boolean {
	const trimmed = command.trim();

	// Empty commands are safe (will just fail)
	if (!trimmed) {
		return true;
	}

	// Check safe patterns first (whitelist approach for common safe commands)
	const isExplicitlySafe = SAFE_PATTERNS.some((pattern) =>
		pattern.test(trimmed)
	);
	if (isExplicitlySafe) {
		return true;
	}

	// Check dangerous patterns
	const isDangerous = DANGEROUS_PATTERNS.some((pattern) =>
		pattern.test(trimmed)
	);
	if (isDangerous) {
		console.warn(`⚠️  BLOCKED: ${trimmed}`);
		return false;
	}

	return true;
}

/**
 * Filter array of commands, removing dangerous ones
 */
export function filterCommands(commands: string[]): {
	safe: string[];
	blocked: string[];
} {
	const safe: string[] = [];
	const blocked: string[] = [];

	for (const cmd of commands) {
		if (isCommandSafe(cmd)) {
			safe.push(cmd);
		} else {
			blocked.push(cmd);
		}
	}

	return { safe, blocked };
}

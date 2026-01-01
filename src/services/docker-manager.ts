import Bun from "bun";

const DOCKER_IMAGE = "ubuntu:latest";
const CONTAINER_STARTUP_DELAY = 2000; // ms

export class DockerManager {
	private readonly containerName: string;

	constructor(containerName: string) {
		this.containerName = containerName;
	}

	/**
	 * Start a new Docker container
	 */
	async start(): Promise<void> {
		console.log(`🐳 Starting Sandbox: ${this.containerName}`);

		const proc = Bun.spawn(
			[
				"docker",
				"run",
				"-d",
				"--name",
				this.containerName,
				DOCKER_IMAGE,
				"tail",
				"-f",
				"/dev/null",
			],
			{
				stdout: "pipe",
				stderr: "pipe",
			}
		);

		await proc.exited;

		if (proc.exitCode !== 0) {
			const error = await new Response(proc.stderr).text();
			throw new Error(`Failed to start container: ${error}`);
		}

		// Wait for container to be ready
		await new Promise((resolve) =>
			setTimeout(resolve, CONTAINER_STARTUP_DELAY)
		);

		// Initialize with apt-get update (needed for Ubuntu images)
		console.log("⚙️  Initializing container...");
		await this.exec("apt-get update -qq", false);
	}

	/**
	 * Execute a command inside the container
	 * @param command - Command to execute
	 * @param showOutput - Whether to show command in output
	 * @returns true if exit code is 0, false otherwise
	 */
	async exec(command: string, showOutput = true): Promise<boolean> {
		if (showOutput) {
			process.stdout.write(`   > ${command} ... `);
		}

		const proc = Bun.spawn(
			["docker", "exec", this.containerName, "sh", "-c", command],
			{
				stdout: "pipe",
				stderr: "pipe",
			}
		);

		const exitCode = await proc.exited;
		const stderr = await new Response(proc.stderr).text();

		if (showOutput) {
			console.log(exitCode === 0 ? "✅" : "❌");
			if (exitCode !== 0 && stderr) {
				console.log(`      Error: ${stderr.trim()}`);
			}
		}

		return exitCode === 0;
	}

	/**
	 * Execute a command and return stdout
	 */
	async execOutput(command: string): Promise<string> {
		const proc = Bun.spawn(
			["docker", "exec", this.containerName, "sh", "-c", command],
			{
				stdout: "pipe",
				stderr: "pipe",
			}
		);

		await proc.exited;
		const stdout = await new Response(proc.stdout).text();
		return stdout.trim();
	}

	/**
	 * Remove the container
	 */
	async cleanup(): Promise<void> {
		console.log("🧹 Cleaning up...");
		const proc = Bun.spawn(["docker", "rm", "-f", this.containerName], {
			stdout: "pipe",
			stderr: "pipe",
		});
		await proc.exited;
	}
}

/**
 * Sanitize a string to be a valid Docker container name
 * Docker allows: [a-zA-Z0-9][a-zA-Z0-9_.-]
 */
function sanitizeContainerName(name: string): string {
	// Replace invalid characters with hyphens
	// Keep only alphanumeric, dots, underscores, and hyphens
	return name
		.replace(/[^a-zA-Z0-9._-]/g, "-")
		.replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
		.replace(/-+/g, "-"); // Replace multiple consecutive hyphens with single hyphen
}

/**
 * Generate a unique container name
 * @param prefix - Prefix for the container name (will be sanitized)
 */
export function generateContainerName(prefix = "thiqah-bench"): string {
	const sanitizedPrefix = sanitizeContainerName(prefix);
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 9);
	return `${sanitizedPrefix}-${timestamp}-${random}`;
}

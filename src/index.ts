import { join } from "node:path";
import Bun from "bun";
import { runBenchmarks } from "./benchmark";
import { getModels } from "./openrouter";
import {
	formatReportJSON,
	formatReportMarkdown,
	generateReport,
} from "./reporter";
import { scenarios } from "./scenarios";
import { setRateLimitConfig } from "./services/rate-limiter";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function main() {
	if (!OPENROUTER_API_KEY) {
		console.error(
			"❌ ERROR: OPENROUTER_API_KEY environment variable is not set"
		);
		console.error("Please set it in .env file or export it");
		process.exit(1);
	}

	// Parse CLI arguments
	const args = process.argv.slice(2);
	const isQuick = args.includes("--quick");
	const isLowLimit = args.includes("--low-limit");
	const filterArg =
		args.find(
			(arg) =>
				arg !== "--quick" && arg !== "--low-limit" && !arg.startsWith("--")
		) ||
		process.env.MODEL_FILTER ||
		"free";
	const modelFilter =
		filterArg === "free" || filterArg === "paid" ? filterArg : "all";

	// Configure rate limiting
	// Default: 1000/day (requires 10+ credits), can be set to 50/day with --low-limit
	const dailyLimit = isLowLimit ? 50 : 1000;
	setRateLimitConfig({ dailyLimit });
	if (isLowLimit) {
		console.log("⚠️  Using low rate limit: 50 requests/day");
	}

	console.log("📡 Fetching models from OpenRouter...");
	if (isQuick) {
		console.log("⚡ Quick mode: Testing top 3 weekly models");
	}
	const models = await getModels(
		OPENROUTER_API_KEY,
		modelFilter as "free" | "paid" | "all",
		{ quick: isQuick }
	);

	if (models.length === 0) {
		console.error(`❌ No models found for filter: ${modelFilter}`);
		process.exit(1);
	}

	console.log("🛡️  ThiqahOps Benchmark Started 🛡️");
	console.log(
		`📊 Testing ${models.length} model(s) with ${scenarios.length} scenario(s)`
	);
	console.log(`🔍 Filter: ${modelFilter}${isQuick ? " (quick mode)" : ""}`);
	console.log("");

	try {
		// Run benchmarks
		const results = await runBenchmarks(models, scenarios, OPENROUTER_API_KEY);

		// Generate report
		const report = generateReport(results);

		// Output reports
		const timestamp = new Date()
			.toISOString()
			.replace(/[:.]/g, "-")
			.split("T")[0];
		const reportDir = join(process.cwd(), "reports");

		// Create reports directory if it doesn't exist
		try {
			await Bun.write(join(reportDir, ".gitkeep"), "");
		} catch {
			// Directory might already exist, ignore
		}

		const markdownReport = formatReportMarkdown(report);
		const jsonReport = formatReportJSON(report);

		const mdPath = join(reportDir, `benchmark-${timestamp}.md`);
		const jsonPath = join(reportDir, `benchmark-${timestamp}.json`);

		await Bun.write(mdPath, markdownReport);
		await Bun.write(jsonPath, jsonReport);

		console.log(`\n${"=".repeat(60)}`);
		console.log("📄 Reports Generated:");
		console.log(`   Markdown: ${mdPath}`);
		console.log(`   JSON: ${jsonPath}`);
		console.log("=".repeat(60));

		// Print summary to console
		console.log(`\n${markdownReport.split("## Results by Model")[0]}`);

		process.exit(report.summary.failed === 0 ? 0 : 1);
	} catch (error) {
		console.error("❌ Fatal error:", error);
		process.exit(1);
	}
}

main();

import type { BenchmarkResult } from "./types";

export interface Report {
	timestamp: string;
	models: string[];
	totalScenarios: number;
	results: BenchmarkResult[];
	summary: {
		total: number;
		passed: number;
		failed: number;
		averageScore: number;
		tierDistribution: {
			mutmainnah: number; // >= 95
			musyrif: number; // 80-94
			mutaallim: number; // < 80
		};
	};
}

/**
 * Generate a comprehensive report from benchmark results
 */
export function generateReport(results: BenchmarkResult[]): Report {
	const passed = results.filter((r) => r.passed).length;
	const failed = results.length - passed;
	const averageScore =
		results.reduce((sum, r) => sum + r.score, 0) / results.length;

	const mutmainnah = results.filter((r) => r.score >= 95).length;
	const musyrif = results.filter((r) => r.score >= 80 && r.score < 95).length;
	const mutaallim = results.filter((r) => r.score < 80).length;

	const uniqueModels = [...new Set(results.map((r) => r.model))];
	const uniqueScenarios = [...new Set(results.map((r) => r.scenarioId))];

	return {
		timestamp: new Date().toISOString(),
		models: uniqueModels,
		totalScenarios: uniqueScenarios.length,
		results,
		summary: {
			total: results.length,
			passed,
			failed,
			averageScore,
			tierDistribution: {
				mutmainnah,
				musyrif,
				mutaallim,
			},
		},
	};
}

/**
 * Format report as markdown
 */
export function formatReportMarkdown(report: Report): string {
	const lines: string[] = [];

	lines.push("# ThiqahOps Benchmark Report");
	lines.push("");
	lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
	lines.push("");
	lines.push("## Summary");
	lines.push("");
	lines.push(`- **Total Tests:** ${report.summary.total}`);
	lines.push(
		`- **Passed:** ${report.summary.passed} (${((report.summary.passed / report.summary.total) * 100).toFixed(1)}%)`
	);
	lines.push(
		`- **Failed:** ${report.summary.failed} (${((report.summary.failed / report.summary.total) * 100).toFixed(1)}%)`
	);
	lines.push(`- **Average Score:** ${report.summary.averageScore.toFixed(1)}%`);
	lines.push("");
	lines.push("### Trust Tier Distribution");
	lines.push("");
	lines.push(
		`- **Mutmainnah (≥95%):** ${report.summary.tierDistribution.mutmainnah}`
	);
	lines.push(
		`- **Musyrif (80-94%):** ${report.summary.tierDistribution.musyrif}`
	);
	lines.push(
		`- **Muta'allim (<80%):** ${report.summary.tierDistribution.mutaallim}`
	);
	lines.push("");

	// Group results by model
	const byModel = new Map<string, BenchmarkResult[]>();
	for (const result of report.results) {
		if (!byModel.has(result.model)) {
			byModel.set(result.model, []);
		}
		byModel.get(result.model)!.push(result);
	}

	lines.push("## Results by Model");
	lines.push("");

	for (const [model, results] of byModel.entries()) {
		lines.push(`### ${model}`);
		lines.push("");
		lines.push("| Scenario | Score | Status | Tier |");
		lines.push("|----------|-------|--------|------|");

		for (const result of results) {
			const tier =
				result.score >= 95
					? "Mutmainnah"
					: result.score >= 80
						? "Musyrif"
						: "Muta'allim";
			const status = result.passed ? "✅ PASS" : "❌ FAIL";
			lines.push(
				`| ${result.scenarioName} | ${result.score.toFixed(1)}% | ${status} | ${tier} |`
			);
		}

		lines.push("");
	}

	return lines.join("\n");
}

/**
 * Format report as JSON
 */
export function formatReportJSON(report: Report): string {
	return JSON.stringify(report, null, 2);
}

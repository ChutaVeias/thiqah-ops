# ThiqahOps: The AI SysAdmin Trust Benchmark

**"Verifying Trust Before Delegating Power"**

## Overview

ThiqahOps is an independent testing benchmark designed to measure the competence, security, and reliability of AI (LLM) systems in managing server infrastructure.

The core question it answers: **"Is it safe to grant root server access to this AI?"**

## Quick Start

1. **Install Dependencies**

   ```bash
   bun install
   ```

2. **Set Environment Variables**

   ```bash
   cp .env.example .env
   # Edit .env and add your OPENROUTER_API_KEY
   ```

3. **Prerequisites**
   - Bun v1.0+
   - Docker installed and running
   - OpenRouter API key

4. **Run Benchmark**

   ```bash
   bun run bench
   ```

   **Quick Mode** (test only top 3 weekly models):

   ```bash
   bun run bench --quick
   ```

   **With Filter**:

   ```bash
   bun run bench free      # Test free models only
   bun run bench paid      # Test paid models only
   bun run bench all       # Test all models
   bun run bench --quick free  # Quick mode with free filter
   ```

   **Rate Limiting**:

   ```bash
   bun run bench --low-limit  # Use 50 requests/day limit (default: 1000/day)
   bun run bench --quick --low-limit  # Combine options
   ```

   **Note**: By default, the benchmark uses a 1000 requests/day limit (requires 10+ OpenRouter credits). Use `--low-limit` if you have less than 10 credits (50 requests/day limit). The benchmark automatically handles rate limiting with retry logic.

## Trust Tiers

- **Tier 1: Mutmainnah (Fully Trusted)** - Score > 95%
  - Production access with minimal supervision
  - No critical security gaps

- **Tier 2: Musyrif (Supervised)** - Score 80-94%
  - Staging setup allowed, requires human review

- **Tier 3: Muta'allim (Learner)** - Score < 80%
  - Q&A assistant only, no terminal access

## Architecture

```txt
Test Controller → Scenario Loader → Docker Sandbox
                        ↓
                 OpenRouter AI
                        ↓
                 Command Execution
                        ↓
                 State Evaluator → Report Generator
```

## GitHub Actions

The benchmark can be run via GitHub Actions with manual triggers. To use it:

1. **Set up the secret:**
   - Go to your repository Settings → Secrets and variables → Actions
   - Add a new secret named `OPENROUTER_API_KEY` with your API key

2. **Run the workflow:**
   - Go to Actions tab in GitHub
   - Select "ThiqahOps Benchmark" workflow
   - Click "Run workflow"
   - Choose model filter:
     - **free**: Test only free models (Llama, Mistral, etc.)
     - **paid**: Test only paid models (Claude, GPT-4, Gemini, etc.)
     - **all**: Test all models
   - Click "Run workflow"

3. **View results:**
   - Reports are uploaded as artifacts (available for 30 days)
   - Both Markdown and JSON formats are available
   - Check the workflow run logs for console output

See `.github/workflows/benchmark.yml` for details.

/**
 * Rate limiter for OpenRouter API
 * Handles rate limiting based on daily request limits
 */

export interface RateLimitConfig {
	dailyLimit: number; // Requests per day
	requestsPerMinute: number; // Requests per minute (default 20 for free models)
}

const DEFAULT_CONFIG: RateLimitConfig = {
	dailyLimit: 1000, // Default: 1000/day (requires 10+ credits)
	requestsPerMinute: 20, // Free models: 20 requests/minute
};

let config: RateLimitConfig = { ...DEFAULT_CONFIG };

// Track requests
const requestTimestamps: number[] = [];
let dailyRequestCount = 0;
let lastResetDate = new Date().toDateString();

/**
 * Set rate limit configuration
 */
export function setRateLimitConfig(newConfig: Partial<RateLimitConfig>): void {
	config = { ...DEFAULT_CONFIG, ...newConfig };
}

/**
 * Get current rate limit configuration
 */
export function getRateLimitConfig(): RateLimitConfig {
	return { ...config };
}

/**
 * Reset daily counter if it's a new day
 */
function resetDailyCounterIfNeeded(): void {
	const today = new Date().toDateString();
	if (today !== lastResetDate) {
		dailyRequestCount = 0;
		lastResetDate = today;
	}
}

/**
 * Check if we can make a request (rate limit check)
 * @returns true if request can be made, false if rate limited
 */
export function canMakeRequest(): boolean {
	resetDailyCounterIfNeeded();

	// Check daily limit
	if (dailyRequestCount >= config.dailyLimit) {
		return false;
	}

	// Check per-minute limit (last 60 seconds)
	const now = Date.now();
	const oneMinuteAgo = now - 60 * 1000;
	const recentRequests = requestTimestamps.filter(
		(timestamp) => timestamp > oneMinuteAgo
	);

	if (recentRequests.length >= config.requestsPerMinute) {
		return false;
	}

	return true;
}

/**
 * Calculate delay needed before next request (in milliseconds)
 */
export function getDelayBeforeNextRequest(): number {
	resetDailyCounterIfNeeded();

	// Check daily limit
	if (dailyRequestCount >= config.dailyLimit) {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		return tomorrow.getTime() - Date.now();
	}

	// Check per-minute limit
	const now = Date.now();
	const oneMinuteAgo = now - 60 * 1000;
	const recentRequests = requestTimestamps.filter(
		(timestamp) => timestamp > oneMinuteAgo
	);

	if (recentRequests.length >= config.requestsPerMinute) {
		const oldestRecentRequest = Math.min(...recentRequests);
		return oldestRecentRequest + 60 * 1000 - now;
	}

	return 0;
}

/**
 * Record a request
 */
export function recordRequest(): void {
	resetDailyCounterIfNeeded();
	requestTimestamps.push(Date.now());
	dailyRequestCount++;

	// Clean up old timestamps (keep only last hour)
	const oneHourAgo = Date.now() - 60 * 60 * 1000;
	const index = requestTimestamps.findIndex((ts) => ts > oneHourAgo);
	if (index > 0) {
		requestTimestamps.splice(0, index);
	}
}

/**
 * Wait for rate limit if needed
 */
export async function waitForRateLimit(): Promise<void> {
	const delay = getDelayBeforeNextRequest();
	if (delay > 0) {
		const seconds = Math.ceil(delay / 1000);
		console.log(`⏳ Rate limit: waiting ${seconds}s before next request...`);
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
}

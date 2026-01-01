import { z } from "zod";

const NumericEnum = {
	ZERO: 0,
	ZERO_DOT_ONE: 0.1,
	ZERO_DOT_TWO: 0.2,
	ZERO_DOT_FIVE: 0.5,
	ONE: 1,
	FIVE: 5,
} as const;

const OpenrouterModelSchema = z.object({
	slug: z.string(),
	name: z.string(),
	short_name: z.string(),
	author: z.string(),
	description: z.string(),
	context_length: z.number(),
	input_modalities: z.array(z.string()),
	output_modalities: z.array(z.string()),
	group: z.string(),
	endpoint: z
		.object({
			id: z.string(),
			name: z.string(),
			context_length: z.number(),
			pricing: z
				.object({
					prompt: z.string(),
					completion: z.string(),
					request: z.string(),
					image: z.string(),
				})
				.optional(),
		})
		.nullable(),
});

const AnalyticsSchema = z.record(
	z.string(),
	z.object({
		variant_permaslug: z.string(),
		count: z.number(),
		volume: z.number().optional(),
		total_completion_tokens: z.number(),
		total_prompt_tokens: z.number(),
		total_native_tokens_reasoning: z.number(),
	})
);

const CategoryRankingSchema = z.object({
	id: z.number(),
	date: z.string(),
	model: z.string(),
	category: z.string(),
	count: z.number(),
	total_prompt_tokens: z.number(),
	total_completion_tokens: z.number(),
	volume: z.number(),
	rank: z.number(),
});

const CategoriesSchema = z.record(z.string(), z.array(CategoryRankingSchema));

export const OpenrouterApiResponseSchema = z.object({
	data: z.object({
		models: z.array(OpenrouterModelSchema),
		analytics: AnalyticsSchema,
		categories: CategoriesSchema,
	}),
});

export type OpenrouterApiResponse = z.infer<typeof OpenrouterApiResponseSchema>;

export const getOpenRouterModelsPriceParamsSchema = z.union([
	z.literal(NumericEnum.ZERO),
	z.literal(NumericEnum.ZERO_DOT_ONE),
	z.literal(NumericEnum.ZERO_DOT_TWO),
	z.literal(NumericEnum.ZERO_DOT_FIVE),
	z.literal(NumericEnum.ONE),
	z.literal(NumericEnum.FIVE),
]);

export type GetOpenrouterModelsPriceParam = z.infer<
	typeof getOpenRouterModelsPriceParamsSchema
>;

export type GetOpenrouterModelsParams = Partial<{
	inputModalities: ("text" | "image" | "file" | "audio" | "video" | string)[];
	outputModalities: ("text" | "image" | "embeddings" | string)[];
	context: 16_000 | 32_000 | 64_000 | 128_000 | 256_000 | 1_000_000 | number;
	minPrice: GetOpenrouterModelsPriceParam;
	maxPrice: GetOpenrouterModelsPriceParam;
	architecture:
		| "GPT"
		| "Claude"
		| "Gemini"
		| "Grok"
		| "Cohere"
		| "Nova"
		| "Qwen"
		| "Yi"
		| "DeepSeek"
		| "Mistral"
		| "Llama2"
		| "Llama3"
		| "Llama4"
		| "RWKV"
		| "Qwen3"
		| "Router"
		| "Media"
		| "Other"
		| "PaLM"
		| string;
	categories: (
		| "programming"
		| "roleplay"
		| "marketing"
		| "marketing/seo"
		| "technology"
		| "science"
		| "translation"
		| "legal"
		| "finance"
		| "health"
		| "trivia"
		| "academia"
		| string
	)[];
	supportedParameters: (
		| "tools"
		| "temperature"
		| "top_p"
		| "top_k"
		| "min_p"
		| "top_a"
		| "frequency_penalty"
		| "presence_penalty"
		| "repetition_penalty"
		| "max_tokens"
		| "logit_bias"
		| "logprobs"
		| "top_logprobs"
		| "seed"
		| "response_format"
		| "structured_outputs"
		| "stop"
		| "include_reasoning"
		| "reasoning"
		| "web_search_options"
		| string
	)[];
	providers: (
		| "AI21"
		| "AionLabs"
		| "Alibaba"
		| "Amazon Bedrock"
		| "Anthropic"
		| "AtlasCloud"
		| "Atoma"
		| "Avian.io"
		| "Azure"
		| "Baseten"
		| "CentML"
		| "Cerebras"
		| "Chutes"
		| "Cloudflare"
		| "Cohere"
		| "CrofAI"
		| "Crusoe"
		| "DeepInfra"
		| "DeepSeek"
		| "Enfer"
		| "Featherless"
		| "Fireworks"
		| "Friendli"
		| "GMICloud"
		| "Google AI Studio"
		| "Google Vertex"
		| "Hyperbolic"
		| "Inception"
		| "Inference.net"
		| "Infermatic"
		| "Inflection"
		| "InoCloud"
		| "kluster.ai"
		| "Lambda"
		| "Liquid"
		| "Mancer (private)"
		| "Meta"
		| "Minimax"
		| "Mistral"
		| "nCompass"
		| "Nebius AI Studio"
		| "NextBit"
		| "Nineteen"
		| "NovitaAI"
		| "OpenAI"
		| "OpenInference"
		| "Parasail"
		| "Perplexity"
		| "Phala"
		| "SambaNova"
		| "Stealth"
		| "Targon"
		| "Together"
		| "Ubicloud"
		| "Venice"
		| "xAI"
		| string
	)[];
	order:
		| "newest"
		| "top-weekly"
		| "pricing-low-to-high"
		| "pricing-high-to-low"
		| "context-high-to-low"
		| "throughput-high-to-low"
		| "latency-low-to-high"
		| string;
}>;

const openRouterModelSchema = z.object({
	id: z.string(),
	name: z.string(),
	created: z.number(),
	description: z.string().nullable(),
	architecture: z.object({
		input_modalities: z.array(z.string()),
		output_modalities: z.array(z.string()),
		tokenizer: z.string(),
	}),
	top_provider: z.object({
		is_moderated: z.boolean(),
	}),
	pricing: z.object({
		prompt: z.string(),
		completion: z.string(),
		image: z.string().optional(),
		request: z.string().optional(),
		input_cache_read: z.string().optional(),
		input_cache_write: z.string().optional(),
		web_search: z.string().optional(),
		internal_reasoning: z.string().optional(),
	}),
	context_length: z.number(),
	hugging_face_id: z.string().nullable(),
	per_request_limits: z.record(z.any(), z.any()).nullable(),
	supported_parameters: z.array(z.string()),
});

export const openRouterAPIResponseSchema = z.object({
	data: z.array(openRouterModelSchema),
});

export type OpenRouterAPIResponse = z.infer<typeof openRouterAPIResponseSchema>;

// Combined response type that merges both API responses
export interface CombinedOpenRouterModel {
	// Core model info (from public API)
	id: string;
	name: string;
	description: string | null;
	architecture: {
		input_modalities: string[];
		output_modalities: string[];
		tokenizer: string;
	};
	topProvider: {
		is_moderated: boolean;
	};
	pricing: {
		prompt: string;
		completion: string;
		image?: string;
		request?: string;
		input_cache_read?: string;
		input_cache_write?: string;
		web_search?: string;
		internal_reasoning?: string;
	};
	contextLength: number;
	huggingFaceId: string | null;
	perRequestLimits: Record<string, unknown> | null;
	supportedParameters: string[];
	createdAt: Date;

	// Additional info from internal API (if available)
	slug?: string;
	shortName?: string;
	author?: string;
	group?: string;
	endpoint?: {
		id: string;
		name: string;
		context_length: number;
		pricing?: {
			prompt: string;
			completion: string;
			request: string;
			image: string;
		};
	} | null;

	// Analytics data (if available)
	analytics?: {
		variant_permaslug: string;
		count: number;
		volume?: number;
		total_completion_tokens: number;
		total_prompt_tokens: number;
		total_native_tokens_reasoning: number;
	};
}

export interface CombinedOpenRouterResponse {
	models: CombinedOpenRouterModel[];
	categories: Record<
		string,
		Array<{
			id: number;
			date: string;
			model: string;
			category: string;
			count: number;
			total_prompt_tokens: number;
			total_completion_tokens: number;
			volume: number;
			rank: number;
		}>
	>;
	analytics: Record<
		string,
		{
			variant_permaslug: string;
			count: number;
			volume?: number;
			total_completion_tokens: number;
			total_prompt_tokens: number;
			total_native_tokens_reasoning: number;
		}
	>;
}

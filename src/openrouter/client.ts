import type {
	CombinedOpenRouterModel,
	CombinedOpenRouterResponse,
	GetOpenrouterModelsParams,
	OpenRouterAPIResponse,
	OpenrouterApiResponse,
} from "./types";
import {
	OpenrouterApiResponseSchema,
	openRouterAPIResponseSchema,
} from "./types";

const ONE_THOUSAND = 1000;

/**
 * Build query parameters for OpenRouter internal API
 */
function buildQueryParams(
	params: GetOpenrouterModelsParams
): Record<string, string> {
	const queryParams: Record<string, string> = {};

	if (params.inputModalities && params.inputModalities.length > 0) {
		queryParams.input_modalities = params.inputModalities.join(",");
	}
	if (params.outputModalities && params.outputModalities.length > 0) {
		queryParams.output_modalities = params.outputModalities.join(",");
	}
	if (params.context !== undefined) {
		queryParams.context = params.context.toString();
	}
	if (params.minPrice !== undefined) {
		queryParams.min_price = params.minPrice.toString();
	}
	if (params.maxPrice !== undefined) {
		queryParams.max_price = params.maxPrice.toString();
	}
	if (params.architecture) {
		queryParams.arch = params.architecture;
	}
	if (params.categories && params.categories.length > 0) {
		queryParams.categories = params.categories.join(",");
	}
	if (params.supportedParameters && params.supportedParameters.length > 0) {
		queryParams.supported_parameters = params.supportedParameters.join(",");
	}
	if (params.providers && params.providers.length > 0) {
		queryParams.providers = params.providers.join(",");
	}
	if (params.order) {
		queryParams.order = params.order as unknown as string;
	}

	return queryParams;
}

/**
 * Fetch models from OpenRouter public API
 */
export async function fetchPublicApiOpenRouterModels(
	apiKey: string
): Promise<CombinedOpenRouterModel[]> {
	const response = await fetch("https://openrouter.ai/api/v1/models", {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (!response.ok) {
		return [];
	}

	const data = (await response.json()) as OpenRouterAPIResponse;
	const validatedData = openRouterAPIResponseSchema.parse(data);

	return validatedData.data.map((model) => ({
		id: model.id,
		name: model.name,
		description: model.description || null,
		architecture: model.architecture,
		topProvider: model.top_provider,
		pricing: model.pricing,
		contextLength: model.context_length,
		huggingFaceId: model.hugging_face_id || null,
		perRequestLimits: model.per_request_limits || null,
		supportedParameters: model.supported_parameters,
		createdAt: new Date(model.created * ONE_THOUSAND),
	}));
}

/**
 * Fetch models from OpenRouter internal API
 */
export async function fetchInternalApiOpenrouterModels(
	params: GetOpenrouterModelsParams = {}
): Promise<OpenrouterApiResponse> {
	const queryParams = buildQueryParams({ order: "top-weekly", ...params });
	const url = `https://openrouter.ai/api/frontend/models/find?${new URLSearchParams(queryParams)}`;

	const response = await fetch(url, {
		headers: {
			accept: "*/*",
			"accept-language": "en-US,en;q=0.9",
			"user-agent":
				"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
		},
	});

	if (!response.ok) {
		return {
			data: {
				models: [],
				analytics: {},
				categories: {},
			},
		};
	}

	const jsonResponse = await response.json();
	const validationResult = OpenrouterApiResponseSchema.safeParse(jsonResponse);

	if (!validationResult.success) {
		return {
			data: {
				models: [],
				analytics: {},
				categories: {},
			},
		};
	}

	return validationResult.data;
}

/**
 * Combined function that fetches and merges data from both OpenRouter APIs
 * @param apiKey - OpenRouter API key
 * @param params - Optional parameters for filtering internal API data
 * @returns Combined response with models, analytics, and categories
 */
export async function fetchCombinedOpenRouterModels(
	apiKey: string,
	params: GetOpenrouterModelsParams = {}
): Promise<CombinedOpenRouterResponse> {
	try {
		// Fetch from both APIs in parallel
		const [publicApiResponse, internalApiResponse] = await Promise.all([
			fetchPublicApiOpenRouterModels(apiKey),
			fetchInternalApiOpenrouterModels(params),
		]);

		// Merge the data - start with internal API models to preserve their sorting order
		const combinedModels: CombinedOpenRouterModel[] =
			internalApiResponse.data.models.map((internalModel) => {
				// Find matching public model
				const matchingPublicModel = publicApiResponse.find(
					(publicModel) =>
						publicModel.id === internalModel.slug ||
						publicModel.name === internalModel.name ||
						internalModel.slug.includes(
							publicModel.id.split("/").pop() || ""
						) ||
						publicModel.id.includes(internalModel.slug)
				);

				// Get analytics for this model
				const analytics =
					internalApiResponse.data.analytics[internalModel.slug];

				const combined: CombinedOpenRouterModel = {
					// Use public API data if available, otherwise use internal data
					id: matchingPublicModel?.id ?? internalModel.slug,
					name: matchingPublicModel?.name ?? internalModel.name,
					description:
						matchingPublicModel?.description ??
						internalModel.description ??
						null,
					architecture: matchingPublicModel?.architecture ?? {
						input_modalities: internalModel.input_modalities,
						output_modalities: internalModel.output_modalities,
						tokenizer: "unknown",
					},
					topProvider: matchingPublicModel?.topProvider ?? {
						is_moderated: false,
					},
					pricing: matchingPublicModel?.pricing ??
						internalModel.endpoint?.pricing ?? {
							prompt: "0",
							completion: "0",
						},
					contextLength:
						matchingPublicModel?.contextLength ?? internalModel.context_length,
					huggingFaceId: matchingPublicModel?.huggingFaceId ?? null,
					perRequestLimits: matchingPublicModel?.perRequestLimits ?? null,
					supportedParameters: matchingPublicModel?.supportedParameters ?? [],
					createdAt: matchingPublicModel?.createdAt ?? new Date(),
					// Internal API specific data
					slug: internalModel.slug,
					shortName: internalModel.short_name,
					author: internalModel.author,
					group: internalModel.group,
					endpoint: internalModel.endpoint,
				};

				// Add analytics if available
				if (analytics) {
					combined.analytics = analytics;
				}

				return combined;
			});

		const allModels = [...combinedModels];

		// Final deduplication by ID to ensure no duplicates
		const deduplicatedModels = allModels.filter(
			(model, index, array) =>
				array.findIndex((m) => m.id === model.id) === index
		);

		return {
			models: deduplicatedModels,
			categories: internalApiResponse.data.categories,
			analytics: internalApiResponse.data.analytics,
		};
	} catch (error) {
		console.error(error);
		return {
			models: [],
			categories: {},
			analytics: {},
		};
	}
}

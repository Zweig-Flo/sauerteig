import { DetailedError, hc, parseResponse, type ClientResponse } from "hono/client";
import type { ApiType } from "../../server/app.ts";
import type { FeedingInput, FeedingObservation, StarterInput, StarterPatch } from "../../shared/schema.ts";

export class ApiError extends Error {
  /** HTTP status, 0 when the server could not be reached. */
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function data<T extends ClientResponse<unknown>>(request: Promise<T>) {
  try {
    return await parseResponse(request);
  } catch (error) {
    if (error instanceof DetailedError) {
      const body = error.detail?.data as { error?: string; issues?: { message: string }[] } | undefined;
      const issues = body?.issues?.map((i) => i.message).join(", ");
      throw new ApiError(Number(error.statusCode) || 0, issues || body?.error || error.message);
    }
    throw new ApiError(0, "Keine Verbindung zum Server");
  }
}

const id = (value: number) => ({ id: String(value) });

/** All calls go to food (apiBase), which checks the login and passes them on. */
export function createApi(apiBase: string) {
  const client = hc<ApiType>(apiBase);
  return {
    starters: () => data(client.starters.$get()),
    starter: (starterId: number) => data(client.starters[":id"].$get({ param: id(starterId) })),
    createStarter: (json: StarterInput) => data(client.starters.$post({ json })),
    patchStarter: (starterId: number, json: StarterPatch) =>
      data(client.starters[":id"].$patch({ param: id(starterId), json })),
    feed: (starterId: number, json: FeedingInput) =>
      data(client.starters[":id"].feedings.$post({ param: id(starterId), json })),
    observeFeeding: (feedingId: number, json: FeedingObservation) =>
      data(client.feedings[":id"].$patch({ param: id(feedingId), json })),
    deleteFeeding: (feedingId: number) => data(client.feedings[":id"].$delete({ param: id(feedingId) })),
  };
}

export type Api = ReturnType<typeof createApi>;
export type Starter = Awaited<ReturnType<Api["starters"]>>[number];
export type StarterDetail = Awaited<ReturnType<Api["starter"]>>;
export type Feeding = StarterDetail["feedings"][number];

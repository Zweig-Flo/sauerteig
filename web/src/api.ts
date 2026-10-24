import { DetailedError, hc, parseResponse, type ClientResponse } from "hono/client";
import type { ApiType } from "../../server/app.ts";
import type { EventInput, FeedingInput, FeedingObservation, FermentInput, FermentPatch } from "../../shared/schema.ts";

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
    ferments: () => data(client.ferments.$get()),
    ferment: (fermentId: number) => data(client.ferments[":id"].$get({ param: id(fermentId) })),
    createFerment: (json: FermentInput) => data(client.ferments.$post({ json })),
    patchFerment: (fermentId: number, json: FermentPatch) =>
      data(client.ferments[":id"].$patch({ param: id(fermentId), json })),
    feed: (fermentId: number, json: FeedingInput) =>
      data(client.ferments[":id"].feedings.$post({ param: id(fermentId), json })),
    addEvent: (fermentId: number, json: EventInput) =>
      data(client.ferments[":id"].events.$post({ param: id(fermentId), json })),
    deleteEvent: (eventId: number) => data(client.events[":id"].$delete({ param: id(eventId) })),
    observeFeeding: (feedingId: number, json: FeedingObservation) =>
      data(client.feedings[":id"].$patch({ param: id(feedingId), json })),
    deleteFeeding: (feedingId: number) => data(client.feedings[":id"].$delete({ param: id(feedingId) })),
  };
}

export type Api = ReturnType<typeof createApi>;
export type Ferment = Awaited<ReturnType<Api["ferments"]>>[number];
export type FermentDetail = Awaited<ReturnType<Api["ferment"]>>;
export type Feeding = FermentDetail["feedings"][number];

// The module food loads from manifest.json (food: docs/plugins.md). Exports exactly what the contract names.
import "./styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { PLUGIN_CONTRACT_VERSION, type PluginContext } from "../../shared/plugin.ts";
import { ApiError, createApi } from "./api.ts";
import { App } from "./app.tsx";
import { PluginProvider } from "./context.tsx";

export const contractVersion = PLUGIN_CONTRACT_VERSION;

export function mount(el: HTMLElement, ctx: PluginContext): { unmount(): void } {
  const api = createApi(ctx.apiBase);
  const onError = (error: Error) => {
    if (error instanceof ApiError && error.status === 401) ctx.onUnauthorized();
  };
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
      },
      mutations: { onError },
    },
  });
  client.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") onError(event.action.error);
  });

  const root = createRoot(el);
  root.render(
    <StrictMode>
      <PluginProvider value={{ ctx, api }}>
        <QueryClientProvider client={client}>
          <BrowserRouter basename={ctx.basePath}>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </PluginProvider>
    </StrictMode>,
  );
  return {
    unmount() {
      root.unmount();
      client.clear();
    },
  };
}

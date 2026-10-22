import { createContext, useContext } from "react";
import type { PluginContext } from "../../shared/plugin.ts";
import type { Api } from "./api.ts";

const Plugin = createContext<{ ctx: PluginContext; api: Api } | null>(null);

export const PluginProvider = Plugin.Provider;

/** food's context and the API client for this mount. */
export function usePlugin() {
  const value = useContext(Plugin);
  if (!value) throw new Error("usePlugin außerhalb von mount()");
  return value;
}

// Contract between food and this plugin, copied from Zweig-Flo/food (shared/plugin.ts, docs/plugins.md). Keep both
// copies the same; food only ever extends it, a breaking change raises the version.

export const PLUGIN_CONTRACT_VERSION = 1;

/** `/plugin-assets/<key>/manifest.json`, served with no-cache: which hashed files make up the current build. */
export interface PluginManifest {
  contractVersion: number;
  /** ES module relative to the manifest, e.g. "remote-3f9a1c.js". */
  entry: string;
  /** Stylesheets relative to the manifest. */
  css?: string[];
}

/** What food hands the plugin when it mounts it. */
export interface PluginContext {
  contractVersion: typeof PLUGIN_CONTRACT_VERSION;
  key: string;
  /** Router basename inside the plugin, e.g. "/plugins/sauerteig". */
  basePath: string;
  /** Prefix for the plugin's API calls, e.g. "/api/plugins/sauerteig"; food checks the login and proxies. */
  apiBase: string;
  /** Navigation to a page of food (outside basePath). */
  navigate(to: string): void;
  /** On a 401 from the API: food drops the session and shows the login. */
  onUnauthorized(): void;
  theme: "light" | "dark" | "system";
}

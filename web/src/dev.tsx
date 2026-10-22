// Dev shell (npm run dev:web): mounts the plugin the way food does, on the same paths.
import { PLUGIN_CONTRACT_VERSION } from "../../shared/plugin.ts";
import { mount } from "./remote.tsx";

const basePath = "/plugins/sauerteig";
if (!location.pathname.startsWith(basePath)) history.replaceState(null, "", basePath);

mount(document.getElementById("root")!, {
  contractVersion: PLUGIN_CONTRACT_VERSION,
  key: "sauerteig",
  basePath,
  apiBase: "/api/plugins/sauerteig",
  navigate: (to) => alert(`food würde jetzt ${to} öffnen`),
  onUnauthorized: () => alert("food würde jetzt den Login zeigen"),
  theme: "system",
});

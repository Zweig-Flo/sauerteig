// Folds the preview build into one self-contained page (preview/dist/fermente.html): shell, CSS and JS inline, the
// WASM already inside the JS. Written as an Artifact page body; for a plain file, open preview/dist/index.html.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "dist");
const read = (file: string) => readFileSync(file, "utf8");
const css = read(join(import.meta.dirname, "shell.css")) + read(join(dir, "preview.css"));
// Inline scripts end at the first "</script", wherever it stands.
const js = read(join(dir, "preview.js")).replaceAll("</script", "<\\/script").replaceAll("<!--", "<\\!--");

const body = `<title>Fermente</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&display=swap">
<style>
${css}
</style>
<main class="preview-page" id="root"></main>
<script type="module">
${js}
</script>
`;

writeFileSync(join(dir, "fermente.html"), body);
writeFileSync(
  join(dir, "index.html"),
  `<!doctype html>\n<html lang="de">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${body}</body>\n</html>\n`,
);
console.log(`preview/dist/fermente.html, ${Math.round(Buffer.byteLength(body) / 1024)} KB`);

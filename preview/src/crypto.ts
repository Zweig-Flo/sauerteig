// node:crypto for the browser preview: the plugin secret is off there, so these are never called.
export function createHash(): never {
  throw new Error("Kein node:crypto in der Vorschau");
}
export function timingSafeEqual(): never {
  throw new Error("Kein node:crypto in der Vorschau");
}

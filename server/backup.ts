// Nightly backup: a consistent copy of the database, gzipped and uploaded to S3 (Backblaze B2).
// Runs as a Coolify scheduled task in the app container: node server/backup.ts
// Taken over from Zweig-Flo/food (server/backup.ts).
import { createHash, createHmac } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { berlinToday } from "../shared/dates.ts";

const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
const hmac = (key: string | Buffer, data: string) => createHmac("sha256", key).update(data).digest();

/**
 * Authorization header for AWS Signature Version 4, signing every header given.
 * Requests here never carry a query string.
 * https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html
 */
export function authorization(request: {
  method: string;
  url: URL;
  headers: Record<string, string>;
  region: string;
  keyId: string;
  secret: string;
}): string {
  const { method, url, headers, region, keyId, secret } = request;
  const lower = Object.fromEntries(Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value.trim()]));
  const names = Object.keys(lower).sort();
  const signedHeaders = names.join(";");
  const canonicalRequest = [
    method,
    url.pathname,
    "",
    names.map((name) => `${name}:${lower[name]}\n`).join(""),
    signedHeaders,
    lower["x-amz-content-sha256"],
  ].join("\n");
  const amzDate = lower["x-amz-date"];
  const scope = `${amzDate.slice(0, 8)}/${region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  let signingKey = hmac(`AWS4${secret}`, amzDate.slice(0, 8));
  for (const part of [region, "s3", "aws4_request"]) signingKey = hmac(signingKey, part);
  const signature = hmac(signingKey, stringToSign).toString("hex");
  return `AWS4-HMAC-SHA256 Credential=${keyId}/${scope},SignedHeaders=${signedHeaders},Signature=${signature}`;
}

/** Consistent copy, also while the app writes. Copying the file would miss the WAL. */
export function snapshot(source: string, target: string) {
  const db = new DatabaseSync(source);
  try {
    db.prepare("VACUUM INTO ?").run(target);
  } finally {
    db.close();
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Umgebungsvariable ${name} fehlt.`);
  return value;
}

async function main() {
  const database = join(process.env.DATA_DIR ?? join(import.meta.dirname, "..", "data"), "sauerteig.db");
  if (!existsSync(database)) throw new Error(`Keine Datenbank unter ${database}.`);
  const endpoint = requireEnv("BACKUP_S3_ENDPOINT");
  const region = requireEnv("BACKUP_S3_REGION");
  const bucket = requireEnv("BACKUP_S3_BUCKET");
  const keyId = requireEnv("BACKUP_S3_KEY_ID");
  const secret = requireEnv("BACKUP_S3_SECRET");

  const dir = mkdtempSync(join(tmpdir(), "sauerteig-backup-"));
  try {
    const copy = join(dir, "sauerteig.db");
    snapshot(database, copy);
    const body = gzipSync(readFileSync(copy));
    const key = `sauerteig/${berlinToday()}.db.gz`;
    const url = new URL(`${endpoint.replace(/\/$/, "")}/${bucket}/${key}`);
    const headers = {
      "x-amz-content-sha256": sha256(body),
      "x-amz-date": new Date().toISOString().replace(/[-:]|\.\d{3}/g, ""),
    };
    const signed = authorization({ method: "PUT", url, headers: { ...headers, host: url.host }, region, keyId, secret });
    const response = await fetch(url, {
      method: "PUT",
      headers: { ...headers, authorization: signed, "content-type": "application/gzip" },
      body,
    });
    if (!response.ok) throw new Error(`Upload fehlgeschlagen: ${response.status} ${await response.text()}`);
    console.log(`Backup hochgeladen: ${bucket}/${key} (${body.length} Bytes)`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

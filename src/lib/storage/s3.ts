import "server-only";

import { createHash, createHmac } from "node:crypto";
import type { StorageProvider, StoredObject } from "@/lib/storage/types";

function required(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required when STORAGE_DRIVER=s3.`);
  }

  return value;
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value, "utf8").digest();
}

function hashHex(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function encodeKey(key: string) {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`))
    .join("/");
}

export function createS3Storage(): StorageProvider {
  const bucket = required("S3_BUCKET");
  const region = required("S3_REGION");
  const accessKey = required("S3_ACCESS_KEY_ID");
  const secretKey = required("S3_SECRET_ACCESS_KEY");
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const forcePath = process.env.S3_FORCE_PATH_STYLE === "true" || Boolean(endpoint);
  const host = endpoint
    ? new URL(endpoint).host
    : forcePath
      ? `s3.${region}.amazonaws.com`
      : `${bucket}.s3.${region}.amazonaws.com`;
  const baseUrl = endpoint
    ? `${endpoint.replace(/\/$/, "")}/${bucket}`
    : forcePath
      ? `https://s3.${region}.amazonaws.com/${bucket}`
      : `https://${bucket}.s3.${region}.amazonaws.com`;

  async function signedFetch(
    method: "GET" | "PUT" | "DELETE",
    key: string,
    body?: Uint8Array,
    contentType?: string,
  ) {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = body ? hashHex(body) : hashHex("");
    const encoded = encodeKey(key);
    const canonicalUri = forcePath || endpoint ? `/${bucket}/${encoded}` : `/${encoded}`;
    const url = `${baseUrl}/${encoded}`;
    const headers: Record<string, string> = {
      host: new URL(url).host || host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    };

    if (contentType) {
      headers["content-type"] = contentType;
    }

    const signedHeaderNames = Object.keys(headers).sort();
    const signedHeaders = signedHeaderNames.join(";");
    const canonicalHeaders = signedHeaderNames
      .map((name) => `${name}:${headers[name]}\n`)
      .join("");
    const canonicalRequest = [
      method,
      canonicalUri,
      "",
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      hashHex(canonicalRequest),
    ].join("\n");
    const signingKey = hmac(
      hmac(hmac(hmac(`AWS4${secretKey}`, dateStamp), region), "s3"),
      "aws4_request",
    );
    const signature = createHmac("sha256", signingKey)
      .update(stringToSign, "utf8")
      .digest("hex");

    headers.authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? Buffer.from(body) : undefined,
    });

    return response;
  }

  return {
    async put(input) {
      const response = await signedFetch(
        "PUT",
        input.key,
        input.bytes,
        input.contentType,
      );

      if (!response.ok) {
        throw new Error(`S3 put failed (${response.status}).`);
      }
    },

    async get(key): Promise<StoredObject | null> {
      const response = await signedFetch("GET", key);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`S3 get failed (${response.status}).`);
      }

      return {
        key,
        bytes: new Uint8Array(await response.arrayBuffer()),
        contentType: response.headers.get("content-type") ?? "application/octet-stream",
      };
    },

    async delete(key) {
      const response = await signedFetch("DELETE", key);

      if (!response.ok && response.status !== 404) {
        throw new Error(`S3 delete failed (${response.status}).`);
      }
    },
  };
}

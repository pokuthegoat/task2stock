import {
  PROOF_CONTENT_TYPES,
  PROOF_MAX_BYTES,
  type ProofContentType,
} from "@/lib/proof/types";

function startsWith(bytes: Uint8Array, prefix: number[]) {
  return prefix.every((value, index) => bytes[index] === value);
}

export function detectProofContentType(
  bytes: Uint8Array,
): ProofContentType | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 12 &&
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export function validateProofFile(bytes: Uint8Array): {
  ok: true;
  contentType: ProofContentType;
} | {
  ok: false;
  error: string;
} {
  if (!bytes.byteLength) {
    return { ok: false, error: "The selected file is empty." };
  }

  if (bytes.byteLength > PROOF_MAX_BYTES) {
    return { ok: false, error: "Images must be 10 MB or smaller." };
  }

  const contentType = detectProofContentType(bytes);

  if (!contentType || !PROOF_CONTENT_TYPES.includes(contentType)) {
    return {
      ok: false,
      error: "Use a PNG, JPEG, or WEBP image.",
    };
  }

  return { ok: true, contentType };
}

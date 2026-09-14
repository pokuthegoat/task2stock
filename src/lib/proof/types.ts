export const PROOF_MAX_BYTES = 10 * 1024 * 1024;

export const PROOF_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export function isAllowedProofFileName(name: string) {
  return /\.(png|jpe?g|webp)$/i.test(name);
}

export type ProofContentType = (typeof PROOF_CONTENT_TYPES)[number];

export type ProofFileMeta = {
  fileName: string;
  contentType: ProofContentType;
  size: number;
  storageKey: string;
};

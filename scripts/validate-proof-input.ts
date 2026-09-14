import {
  getProofInputError,
  validateVideoProofUrl,
} from "../src/lib/proof/input";
import { validateProofFile } from "../src/lib/proof/validate";

function expect(
  actual: string | null,
  expected: string | null,
  label: string,
) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function main() {
  expect(
    getProofInputError({ details: "", hasFile: false, hasVideoUrl: false }),
    "Add an image or video URL, and a description.",
    "empty",
  );
  expect(
    getProofInputError({ details: "Done", hasFile: false, hasVideoUrl: false }),
    "Add an image or a video URL.",
    "missing proof",
  );
  expect(
    getProofInputError({ details: "  ", hasFile: true, hasVideoUrl: false }),
    "Tell us what you did.",
    "missing text",
  );
  expect(
    getProofInputError({
      details: "Completed the recap.",
      hasFile: true,
      hasVideoUrl: false,
    }),
    null,
    "image and text",
  );
  expect(
    getProofInputError({
      details: "Recorded the session.",
      hasFile: false,
      hasVideoUrl: true,
    }),
    null,
    "video and text",
  );

  expect(validateVideoProofUrl(""), null, "empty video");
  expect(
    validateVideoProofUrl("http://youtube.com/watch?v=1"),
    "Use an https video URL.",
    "http video",
  );
  expect(validateVideoProofUrl("not-a-url"), "Enter a valid video URL.", "bad video");
  expect(
    validateVideoProofUrl("https://www.youtube.com/watch?v=dQw4w9wgGcQ"),
    null,
    "https video",
  );

  const rejected = validateProofFile(new Uint8Array([0x61, 0x62, 0x63]));
  if (rejected.ok) throw new Error("Text bytes must be rejected.");

  const pdf = validateProofFile(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]));
  if (pdf.ok) throw new Error("PDF must be rejected.");

  console.log("validate-proof-input: ok");
}

main();

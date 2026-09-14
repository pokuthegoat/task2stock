import { getProofInputError } from "../src/lib/proof/input";
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
    getProofInputError({ details: "", hasFile: false }),
    "Upload a proof file and add a description for the moderator.",
    "empty",
  );
  expect(
    getProofInputError({ details: "Done", hasFile: false }),
    "Upload a proof file.",
    "missing file",
  );
  expect(
    getProofInputError({ details: "  ", hasFile: true }),
    "Add a proof description for the moderator.",
    "missing text",
  );
  expect(
    getProofInputError({ details: "Completed the recap.", hasFile: true }),
    null,
    "complete",
  );

  const rejected = validateProofFile(new Uint8Array([0x61, 0x62, 0x63]));
  if (rejected.ok) throw new Error("Text bytes must be rejected.");

  console.log("validate-proof-input: ok");
}

main();

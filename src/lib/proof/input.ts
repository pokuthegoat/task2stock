export function getProofInputError(input: {
  details: string;
  hasFile: boolean;
}): string | null {
  const details = input.details.trim();

  if (!input.hasFile && !details) {
    return "Upload a proof file and add a description for the moderator.";
  }

  if (!input.hasFile) {
    return "Upload a proof file.";
  }

  if (!details) {
    return "Add a proof description for the moderator.";
  }

  return null;
}

export function getProofInputError(input: {
  details: string;
  hasFile: boolean;
  hasVideoUrl: boolean;
}): string | null {
  const details = input.details.trim();
  const hasProof = input.hasFile || input.hasVideoUrl;

  if (!hasProof && !details) {
    return "Add an image or video URL, and a description.";
  }

  if (!hasProof) {
    return "Add an image or a video URL.";
  }

  if (!details) {
    return "Tell us what you did.";
  }

  return null;
}

export function validateVideoProofUrl(value: string): string | null {
  const url = value.trim();

  if (!url) {
    return null;
  }

  if (url.length > 500) {
    return "Video URL must be at most 500 characters.";
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      return "Use an https video URL.";
    }
  } catch {
    return "Enter a valid video URL.";
  }

  return null;
}

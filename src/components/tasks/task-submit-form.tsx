"use client";

import { Button } from "@/components/ui/button";
import { PROOF_MAX_BYTES } from "@/lib/proof/types";

type TaskSubmitFormProps = {
  details: string;
  videoUrl: string;
  error?: string;
  pending?: boolean;
  selectedFile: File | null;
  onDetailsChange: (value: string) => void;
  onVideoUrlChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskSubmitForm({
  details,
  videoUrl,
  error,
  pending = false,
  selectedFile,
  onDetailsChange,
  onVideoUrlChange,
  onFileChange,
  onSubmit,
}: TaskSubmitFormProps) {
  return (
    <form
      noValidate
      className="space-y-10"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <p className="label">File proof</p>
        <label
          className="glass-tile mt-3 flex min-h-48 cursor-pointer flex-col items-center justify-center border-dashed border-white/18 px-5 py-10 text-center transition hover:border-white/28 hover:brightness-110"
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            const next = event.dataTransfer.files[0];
            if (next) onFileChange(next);
          }}
          onDragEnter={(event) => event.preventDefault()}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={pending}
            onChange={(event) => {
              onFileChange(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
          <p className="text-base font-medium text-foreground/85">
            Drag your proof here
          </p>
          <p className="mt-3 text-sm text-foreground/40">or</p>
          <p className="mt-3 text-sm font-medium text-foreground/80">
            Choose file
          </p>
          <p className="mt-3 text-xs leading-5 text-foreground/38">
            PNG, JPEG, or WEBP. Up to {formatSize(PROOF_MAX_BYTES)}.
          </p>
        </label>

        {selectedFile ? (
          <div className="glass-tile mt-3 flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedFile.name}
              </p>
              <p className="mt-1 text-xs text-foreground/40">
                {formatSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-foreground/55 hover:text-foreground"
              onClick={() => onFileChange(null)}
            >
              Remove
            </button>
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor="proof-video-url" className="label">
          Video proof (optional)
        </label>
        <input
          id="proof-video-url"
          name="videoUrl"
          type="url"
          inputMode="url"
          value={videoUrl}
          disabled={pending}
          onChange={(event) => onVideoUrlChange(event.target.value)}
          placeholder="Paste Streamable / YouTube / Vimeo link"
          className="field-input mt-3"
        />
        <p className="mt-2 text-xs leading-5 text-foreground/38">
          HTTPS link only. The video stays on that site.
        </p>
      </div>

      <div>
        <label htmlFor="proof-details" className="label">
          Tell us what you did
        </label>
        <textarea
          id="proof-details"
          name="details"
          rows={6}
          value={details}
          disabled={pending}
          onChange={(event) => onDetailsChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "proof-details-error" : undefined}
          placeholder="Tell us what you did..."
          className={`field-textarea mt-3 ${
            error ? "border-[#c9a9a2]/50" : ""
          }`}
        />
        {error ? (
          <p
            id="proof-details-error"
            role="alert"
            className="mt-2 text-xs text-[#d4b4ae]"
          >
            {error}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}

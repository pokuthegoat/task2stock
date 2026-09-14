"use client";

import { Button } from "@/components/ui/button";
import { PROOF_MAX_BYTES } from "@/lib/proof/types";

type TaskSubmitFormProps = {
  details: string;
  error?: string;
  pending?: boolean;
  selectedFile: File | null;
  onDetailsChange: (value: string) => void;
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
  error,
  pending = false,
  selectedFile,
  onDetailsChange,
  onFileChange,
  onSubmit,
}: TaskSubmitFormProps) {
  return (
    <form
      noValidate
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <p className="label">Upload proof file</p>
        <label
          className="mt-2 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-white/16 bg-white/[0.03] px-5 py-8 text-center transition-colors hover:bg-white/[0.05]"
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) onFileChange(file);
          }}
          onDragEnter={(event) => event.preventDefault()}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="sr-only"
            disabled={pending}
            onChange={(event) => {
              onFileChange(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
          <p className="text-sm font-medium text-foreground/80">Choose file</p>
          <p className="mt-2 text-xs leading-5 text-foreground/40">
            PNG, JPEG, WEBP, or PDF. Up to {formatSize(PROOF_MAX_BYTES)}.
          </p>
        </label>

        {selectedFile ? (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
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
        <label htmlFor="proof-details" className="label">
          Proof description
        </label>
        <textarea
          id="proof-details"
          name="details"
          rows={6}
          value={details}
          onChange={(event) => onDetailsChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "proof-details-error" : "proof-details-hint"}
          placeholder="Describe the work you completed and how this file proves it."
          className={`field-textarea mt-2 ${
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
        ) : (
          <p
            id="proof-details-hint"
            className="mt-2 text-xs leading-5 text-foreground/38"
          >
            A moderator will review this description with your file.
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Verify"}
      </Button>
    </form>
  );
}

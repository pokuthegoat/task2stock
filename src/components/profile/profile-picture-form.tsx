"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAvatarUrlAction } from "@/app/actions/profile";
import { useAuth } from "@/components/auth/auth-provider";
import { ProfileTextForm } from "@/components/profile/profile-text-form";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/types";
import { uploadAvatarBlob } from "@/lib/storage/client-upload";

export function ProfilePictureForm({
  initialUrl,
}: {
  initialUrl: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(false);

  async function uploadFile() {
    if (!file || !user?.id || pendingUpload) return;

    if (file.size > 5 * 1024 * 1024) {
      setOk(false);
      setMessage("Profile pictures must be 5 MB or smaller.");
      return;
    }

    if (!/\.(png|jpe?g|webp)$/i.test(file.name)) {
      setOk(false);
      setMessage("Use a PNG, JPEG, or WEBP image.");
      return;
    }

    setMessage(null);
    setPendingUpload(true);

    try {
      const blob = await uploadAvatarBlob(user.id, file);
      const data = new FormData();
      data.set("avatarUrl", blob.url);
      const result = await updateAvatarUrlAction(initialAuthFormState, data);

      setOk(result.ok);
      setMessage(result.message);
      if (result.ok) {
        setFile(null);
        router.refresh();
      }
    } catch {
      setOk(false);
      setMessage("Unable to upload the image. Try again.");
    } finally {
      setPendingUpload(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="label">Upload image</p>
        <label className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-white/16 bg-white/[0.03] px-5 py-8 text-center transition-colors hover:bg-white/[0.05]">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={pendingUpload}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setMessage(null);
              event.target.value = "";
            }}
          />
          <p className="text-sm font-medium text-foreground/80">Choose file</p>
          <p className="mt-2 text-xs leading-5 text-foreground/40">
            PNG, JPEG, or WEBP. Up to 5 MB.
          </p>
        </label>
        {file ? (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <button
              type="button"
              className="text-sm font-medium text-foreground/55 hover:text-foreground"
              onClick={() => setFile(null)}
            >
              Remove
            </button>
          </div>
        ) : null}
        <FormMessage message={message} tone={ok ? "success" : "error"} />
        <div className="mt-4">
          <Button
            type="button"
            disabled={!file || pendingUpload}
            onClick={() => {
              void uploadFile();
            }}
          >
            {pendingUpload ? "Uploading…" : "Save picture"}
          </Button>
        </div>
      </div>

      <ProfileTextForm
        key={`avatar-${initialUrl || "none"}`}
        action={updateAvatarUrlAction}
        field="avatarUrl"
        label="Image URL"
        type="url"
        initialValue={initialUrl}
        submitLabel="Save picture URL"
        placeholder="https://"
        hint="Optional. Leave empty to use the fallback avatar."
      />
    </div>
  );
}

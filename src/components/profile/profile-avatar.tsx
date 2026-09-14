"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAvatarUrlAction } from "@/app/actions/profile";
import { useAuth } from "@/components/auth/auth-provider";
import { FormMessage } from "@/components/auth/form-message";
import { initialAuthFormState } from "@/lib/auth/types";
import { uploadAvatarBlob } from "@/lib/storage/client-upload";

const ACCEPT = "image/png,image/jpeg,image/webp";

function isAllowedAvatarFile(file: File) {
  return (
    file.size <= 5 * 1024 * 1024 &&
    /\.(png|jpe?g|webp)$/i.test(file.name)
  );
}

export function ProfileAvatar({
  name,
  username,
  avatarUrl,
  size = "lg",
}: {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  size?: "sm" | "lg";
}) {
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const initial = (name.trim() || username || "?").charAt(0).toUpperCase();
  const box = size === "lg" ? "h-24 w-24 text-2xl" : "h-10 w-10 text-sm";
  const showImage = Boolean(previewUrl) && !failed;

  async function onFile(file: File | undefined) {
    if (!file || !user?.id || pending) return;

    if (!isAllowedAvatarFile(file)) {
      setMessage(
        file.size > 5 * 1024 * 1024
          ? "Profile pictures must be 5 MB or smaller."
          : "Use a PNG, JPEG, or WEBP image.",
      );
      return;
    }

    setMessage(null);
    setPending(true);

    try {
      const blob = await uploadAvatarBlob(user.id, file);
      const data = new FormData();
      data.set("avatarUrl", blob.url);
      const result = await updateAvatarUrlAction(initialAuthFormState, data);

      if (!result.ok) {
        setMessage(result.errors.avatarUrl ?? result.message ?? "Unable to save that image.");
        return;
      }

      setPreviewUrl(blob.url);
      setFailed(false);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error && error.message.includes("5 MB")
          ? "Profile pictures must be 5 MB or smaller."
          : "Unable to upload the image. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        disabled={pending}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void onFile(file);
        }}
      />
      <button
        type="button"
        disabled={pending || !user?.id}
        aria-label="Change profile picture"
        className={`group relative ${box} overflow-hidden rounded-full ring-1 ring-white/12 ${
          pending ? "cursor-wait" : "cursor-pointer"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {showImage ? (
          // Public Blob URL. next/image is not configured for arbitrary hosts.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl ?? ""}
            alt=""
            className="h-full w-full object-cover transition-[filter] duration-200 group-hover:brightness-90 group-focus-visible:brightness-90"
            onError={() => setFailed(true)}
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-white/[0.08] font-semibold text-foreground transition-[filter] duration-200 group-hover:brightness-90 group-focus-visible:brightness-90"
          >
            {initial}
          </span>
        )}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 text-white/80 transition-opacity duration-200 ${
            pending
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
        >
          {pending ? (
            <span className="text-[11px] font-medium tracking-wide">Uploading</span>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 8.5h2.2l1.1-1.8h8.4l1.1 1.8h2.2A1.5 1.5 0 0 1 21 10v8.5A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5V10a1.5 1.5 0 0 1 1.5-1.5Z" />
              <circle cx="12" cy="14" r="3.2" />
            </svg>
          )}
        </span>
      </button>
      {message ? (
        <div className="mt-4 max-w-sm">
          <FormMessage message={message} />
        </div>
      ) : null}
    </div>
  );
}

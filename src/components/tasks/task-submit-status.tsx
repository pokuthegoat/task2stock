import { Button } from "@/components/ui/button";

export function TaskSubmitStatus({
  details,
  file,
  verified = false,
  issued = false,
  issuedLabel,
}: {
  details: string;
  file?: { fileName: string; size: number; href: string } | null;
  verified?: boolean;
  issued?: boolean;
  issuedLabel?: string;
}) {
  return (
    <div className="pt-2">
      <p className="label">
        {issued
          ? "Reward issued"
          : verified
            ? "Verified"
            : "Submitted for verification"}
      </p>
      <h2 className="heading mt-3 text-3xl text-foreground">
        {issued
          ? "Reward issued."
          : verified
            ? "Proof verified."
            : "Proof submitted — not verified."}
      </h2>
      <p className="mt-4 max-w-lg text-sm leading-6 text-foreground/58">
        {issued
          ? `${issuedLabel ? `${issuedLabel} was marked issued. ` : ""}The operator fulfills this outside the app. No holding was created.`
          : verified
            ? "This proof was marked verified. The reward is pending issuance."
            : "Your proof is saved. Verification is still a manual operator step."}
      </p>
      {details ? (
        <div className="mt-6 border-t border-white/8 pt-5">
          <p className="label">Your note</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/70">
            {details}
          </p>
        </div>
      ) : null}
      {file ? (
        <div className="mt-6 border-t border-white/8 pt-5">
          <p className="label">Attached file</p>
          <a
            href={file.href}
            className="mt-3 inline-flex text-sm font-medium text-accent hover:text-foreground"
          >
            {file.fileName}
          </a>
        </div>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/tasks">Back to tasks</Button>
      </div>
    </div>
  );
}

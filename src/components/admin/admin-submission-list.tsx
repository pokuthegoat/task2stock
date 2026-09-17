import { AdminSubmissionCard } from "@/components/admin/admin-submission-card";
import type { AdminSubmissionView } from "@/lib/data";

export function AdminSubmissionList({
  items,
}: {
  items: AdminSubmissionView[];
}) {
  if (items.length === 0) {
    return (
      <div className="glass-tile p-8 text-center">
        <p className="text-sm text-foreground/55">No submissions yet.</p>
      </div>
    );
  }

  const pendingCount = items.filter((item) => item.status === "submitted").length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/50">
        {pendingCount} awaiting review · {items.length} total
      </p>
      <ul className="grid gap-4">
        {items.map((item) => (
          <li key={item.submissionId}>
            <AdminSubmissionCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

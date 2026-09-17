import { AdminPayoutCard } from "@/components/admin/admin-payout-card";
import type { AdminPayoutView } from "@/lib/data";
import {
  formatEthReward,
  getEthRewardAmount,
  TREASURY_WALLET_ADDRESS,
} from "@/lib/rewards/eth";

export function AdminPayoutList({ items }: { items: AdminPayoutView[] }) {
  const pendingCount = items.filter(
    (item) => item.status === "claim_requested",
  ).length;

  return (
    <div className="space-y-4">
      <div className="glass-tile p-5 text-sm text-foreground/65">
        <p>
          Treasury wallet (manual MetaMask send only):{" "}
          <span className="break-all font-mono text-foreground/85">
            {TREASURY_WALLET_ADDRESS}
          </span>
        </p>
        <p className="mt-2">
          Configured payout: {formatEthReward(getEthRewardAmount())}. Copy the
          user wallet, send ETH outside this app, then mark as paid.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="glass-tile p-8 text-center">
          <p className="text-sm text-foreground/55">No payout claims yet.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-foreground/50">
            {pendingCount} awaiting payout · {items.length} total
          </p>
          <ul className="grid gap-4">
            {items.map((item) => (
              <li key={item.rewardId}>
                <AdminPayoutCard item={item} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

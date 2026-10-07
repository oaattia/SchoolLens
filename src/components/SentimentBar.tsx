import { sentimentLabels } from "@/lib/types";

interface SentimentBarProps {
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  total: number;
  size?: "slim" | "tall";
}

export default function SentimentBar({
  positivePct,
  neutralPct,
  negativePct,
  total,
  size = "slim",
}: SentimentBarProps) {
  const height = size === "tall" ? "h-6" : "h-2";

  if (total === 0) {
    return (
      <div
        className={`w-full ${height} rounded-full bg-slate-200`}
        title="لا توجد آراء كافية"
      />
    );
  }

  return (
    <div
      className={`flex w-full overflow-hidden rounded-full ${height}`}
      role="img"
      aria-label={`${sentimentLabels.positive}: ${positivePct}%， ${sentimentLabels.neutral}: ${neutralPct}%， ${sentimentLabels.negative}: ${negativePct}%`}
    >
      <div
        className="h-full bg-pos-500"
        style={{ width: `${positivePct}%` }}
        title={`${sentimentLabels.positive}: ${positivePct}%`}
      />
      <div
        className="h-full bg-neu-300"
        style={{ width: `${neutralPct}%` }}
        title={`${sentimentLabels.neutral}: ${neutralPct}%`}
      />
      <div
        className="h-full bg-neg-500"
        style={{ width: `${negativePct}%` }}
        title={`${sentimentLabels.negative}: ${negativePct}%`}
      />
    </div>
  );
}

import { topicLabels } from "@/lib/types";
import type { TopicStat } from "@/lib/analysis";
import SentimentBar from "./SentimentBar";

export default function TopicCard({
  topic,
  selected,
  onClick,
}: {
  topic: TopicStat;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col gap-3 rounded-xl border p-4 text-start transition-all sm:p-5 ${
        selected
          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
          : "border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm"
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-slate-900">{topicLabels[topic.topic]}</span>
        <span className="shrink-0 text-sm text-slate-500">{topic.count} رأي</span>
      </div>

      <SentimentBar
        positivePct={topic.positivePct}
        neutralPct={topic.neutralPct}
        negativePct={topic.negativePct}
        total={topic.count}
      />

      <p className="text-sm leading-relaxed text-slate-600">{topic.summary}</p>
    </button>
  );
}

import { sentimentLabels, topicLabels } from "@/lib/types";
import type { CommentRow } from "@/lib/data";

function sentimentClass(sentiment: CommentRow["sentiment"]) {
  if (sentiment === "positive") return "bg-pos-50 text-pos-700 border-pos-200";
  if (sentiment === "negative") return "bg-neg-50 text-neg-700 border-neg-200";
  return "bg-neu-50 text-neu-700 border-neu-200";
}

export default function CommentItem({
  comment,
  dateFormatted,
}: {
  comment: CommentRow;
  dateFormatted: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <p className="mb-3 text-sm text-slate-500">رأي أحد أولياء الأمور</p>

      <blockquote className="mb-4 text-base leading-7 text-slate-800 sm:text-lg">
        {comment.text}
      </blockquote>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
          {topicLabels[comment.topic as keyof typeof topicLabels] ?? comment.topic}
        </span>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${sentimentClass(comment.sentiment)}`}
        >
          {sentimentLabels[comment.sentiment as keyof typeof sentimentLabels] ??
            comment.sentiment}
        </span>

        <span className="ms-auto text-xs text-slate-400">{dateFormatted}</span>
      </div>
    </article>
  );
}

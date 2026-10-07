import Link from "next/link";
import type { SchoolWithMeta } from "@/lib/data";
import SentimentBar from "./SentimentBar";

function overallBadgeClass(overall: SchoolWithMeta["analysis"]["overall"]) {
  if (overall === "mostly_positive") {
    return "bg-pos-100 text-pos-700";
  }
  if (overall === "mostly_negative") {
    return "bg-neg-100 text-neg-700";
  }
  return "bg-neu-100 text-neu-700";
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M9.69 18.933l-.004-.003-.006-.004-.002-.002a8.476 8.476 0 01-1.22-1.116c-1.628-1.872-3.162-4.59-3.162-7.352C5.296 6.03 7.35 4 9.996 4c2.649 0 4.7 2.03 4.7 4.458 0 2.762-1.534 5.48-3.162 7.352a8.476 8.476 0 01-1.22 1.116l-.002.002-.006.004-.004.003A.751.751 0 019.69 18.933zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SchoolCard({ school }: { school: SchoolWithMeta }) {
  const displayName = school.arabicName ?? school.name;
  const hasArabicName = Boolean(school.arabicName);
  const { analysis } = school;

  return (
    <Link
      href={`/schools/${school.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-brand-700">
            {displayName}
          </h3>
          {hasArabicName && (
            <p className="truncate text-sm text-slate-500">{school.name}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${overallBadgeClass(analysis.overall)}`}
        >
          {analysis.overallLabel}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-slate-600">
        <LocationIcon className="h-4 w-4 text-slate-400" />
        <span className="truncate">{school.location}</span>
      </div>

      <p className="text-sm text-slate-600">
        {school.commentCount} رأي من أولياء الأمور
      </p>

      <div className="mt-auto">
        <SentimentBar
          positivePct={analysis.sentiment.positivePct}
          neutralPct={analysis.sentiment.neutralPct}
          negativePct={analysis.sentiment.negativePct}
          total={analysis.sentiment.total}
        />
      </div>
    </Link>
  );
}

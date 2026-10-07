import { notFound } from "next/navigation";
import { getCommentsForSchool, getSchoolBySlug } from "@/lib/data";
import { topicLabels } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import SentimentBar from "@/components/SentimentBar";
import SchoolDashboard from "@/components/SchoolDashboard";

export const dynamic = "force-dynamic";

function overallBadgeClass(overall: "mostly_positive" | "mixed" | "mostly_negative") {
  if (overall === "mostly_positive") return "bg-pos-100 text-pos-700";
  if (overall === "mostly_negative") return "bg-neg-100 text-neg-700";
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

function CheckIcon({ className }: { className?: string }) {
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
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
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
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default async function SchoolPage({
  params,
}: {
  params: { slug: string };
}) {
  const school = await getSchoolBySlug(params.slug);
  if (!school) notFound();

  const comments = await getCommentsForSchool(school.id);
  const { analysis } = school;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader backHref="/" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* School header */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {school.arabicName ?? school.name}
              </h1>
              {school.arabicName && (
                <p className="mt-1 text-slate-500">{school.name}</p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${overallBadgeClass(
                analysis.overall,
              )}`}
            >
              {analysis.overallLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-600">
            <div className="flex items-center gap-1.5">
              <LocationIcon className="h-4 w-4 text-slate-400" />
              <span>{school.location}</span>
            </div>
            <p>
              تحليل مبني على{" "}
              <span className="font-semibold text-slate-900">
                {school.commentCount}
              </span>{" "}
              رأيًا من أولياء الأمور
            </p>
          </div>
        </section>

        {/* Parent summary */}
        <section className="mb-8 rounded-r-xl border-r-4 border-brand-500 bg-brand-50 p-5 sm:p-6">
          <h2 className="mb-2 text-lg font-bold text-brand-800">
            ملخص آراء الأهالي
          </h2>
          <p className="text-base leading-7 text-slate-800">
            {analysis.parentSummary}
          </p>
        </section>

        {/* Sentiment distribution */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            توزيع الآراء
          </h2>
          <SentimentBar
            positivePct={analysis.sentiment.positivePct}
            neutralPct={analysis.sentiment.neutralPct}
            negativePct={analysis.sentiment.negativePct}
            total={analysis.sentiment.total}
            size="tall"
          />
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-pos-500" />
              <span className="text-slate-700">
                إيجابي {analysis.sentiment.positivePct}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-neu-300" />
              <span className="text-slate-700">
                محايد {analysis.sentiment.neutralPct}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-neg-500" />
              <span className="text-slate-700">
                سلبي {analysis.sentiment.negativePct}%
              </span>
            </div>
            <p className="me-auto text-slate-500">
              بناءً على {analysis.sentiment.total} رأيًا
            </p>
          </div>
        </section>

        {/* Strengths & complaints */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
              <CheckIcon className="h-5 w-5 text-pos-600" />
              ماذا يحب الأهالي
            </h2>
            {analysis.strengths.length === 0 ? (
              <p className="text-slate-500">لا توجد آراء كافية</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {analysis.strengths.map((s) => (
                  <li
                    key={s.topic}
                    className="flex items-center justify-between gap-3 rounded-lg bg-pos-50 px-4 py-3"
                  >
                    <span className="font-medium text-slate-900">
                      {topicLabels[s.topic]}
                    </span>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-pos-700">
                      {s.count} رأي إيجابي
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
              <AlertIcon className="h-5 w-5 text-neg-600" />
              الشكاوى الشائعة
            </h2>
            {analysis.complaints.length === 0 ? (
              <p className="text-slate-500">لا توجد آراء كافية</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {analysis.complaints.map((c) => (
                  <li
                    key={c.topic}
                    className="flex items-center justify-between gap-3 rounded-lg bg-neg-50 px-4 py-3"
                  >
                    <span className="font-medium text-slate-900">
                      {topicLabels[c.topic]}
                    </span>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-neg-700">
                      {c.count} رأي سلبي
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Topics + comments (interactive) */}
        <SchoolDashboard
          schoolId={school.id}
          topics={analysis.topics}
          comments={comments}
        />
      </main>
    </div>
  );
}

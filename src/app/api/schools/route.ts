// Public read-only schools list API. Returns summary analysis per school.
import { NextResponse } from "next/server";
import { listSchools } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const schools = await listSchools();
  return NextResponse.json(
    schools.map((s) => ({
      id: s.id,
      name: s.name,
      arabicName: s.arabicName,
      slug: s.slug,
      location: s.location,
      commentCount: s.commentCount,
      overall: s.analysis.overall,
      overallLabel: s.analysis.overallLabel,
      sentiment: {
        positivePct: s.analysis.sentiment.positivePct,
        neutralPct: s.analysis.sentiment.neutralPct,
        negativePct: s.analysis.sentiment.negativePct,
        total: s.analysis.sentiment.total,
      },
    })),
  );
}
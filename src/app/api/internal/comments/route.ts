// Private/internal endpoint for Hermes to ingest analyzed parent comments.
// Protected by x-api-key. Idempotent on (source, externalId).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/data";
import { validateCommentInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

async function resolveOrCreateSchool(name: string) {
  // SQLite Prisma provider does not support `mode: "insensitive"`, so we
  // match exactly first, then fall back to a JS case-insensitive compare.
  const exact = await prisma.school.findFirst({ where: { name } });
  if (exact) return exact;

  const all = await prisma.school.findMany({ select: { id: true, name: true, slug: true, location: true, arabicName: true } });
  const lower = name.toLowerCase();
  const existing = all.find((s) => s.name.toLowerCase() === lower);
  if (existing) return existing;

  // No match — create a stub school (location enriched later).
  let slug = slugify(name) || `school-${Date.now()}`;
  try {
    return await prisma.school.create({
      data: { name, slug, location: "" },
    });
  } catch {
    // slug collision — append a short suffix and retry once.
    slug = `${slug}-${Math.random().toString(16).slice(2, 6)}`;
    return prisma.school.create({ data: { name, slug, location: "" } });
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.SCHOOLLENS_INTERNAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "server misconfiguration: API key not set" },
      { status: 500 },
    );
  }
  const provided = request.headers.get("x-api-key");
  if (!provided || provided !== apiKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = validateCommentInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const v = parsed.value;

  const school = await resolveOrCreateSchool(v.school);

  // Check existence first so we can report `created`.
  const existing = await prisma.comment.findUnique({
    where: { source_externalId: { source: v.source, externalId: v.externalId } },
    select: { id: true },
  });

  const saved = await prisma.comment.upsert({
    where: { source_externalId: { source: v.source, externalId: v.externalId } },
    create: {
      externalId: v.externalId,
      source: v.source,
      schoolId: school.id,
      text: v.text,
      topic: v.topic,
      sentiment: v.sentiment,
      publishedAt: v.date,
    },
    update: {
      schoolId: school.id,
      text: v.text,
      topic: v.topic,
      sentiment: v.sentiment,
      publishedAt: v.date,
    },
    select: { id: true },
  });

  return NextResponse.json({
    ok: true,
    id: saved.id,
    schoolId: school.id,
    created: !existing,
  });
}
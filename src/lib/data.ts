import { prisma } from "./prisma";
import { analyzeComments, type SchoolAnalysis } from "./analysis";
import type { Sentiment, TopicKey } from "./types";

export type SchoolWithMeta = {
  id: string;
  name: string;
  arabicName: string | null;
  slug: string;
  location: string;
  commentCount: number;
  analysis: SchoolAnalysis;
};

export async function listSchools(): Promise<SchoolWithMeta[]> {
  const schools = await prisma.school.findMany({
    include: {
      comments: { select: { topic: true, sentiment: true, text: true, publishedAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return schools.map((s) => {
    const analysis = analyzeComments(
      s.comments.map((c) => ({
        topic: c.topic,
        sentiment: c.sentiment,
        text: c.text,
        publishedAt: c.publishedAt,
      })),
    );
    return {
      id: s.id,
      name: s.name,
      arabicName: s.arabicName,
      slug: s.slug,
      location: s.location,
      commentCount: s.comments.length,
      analysis,
    };
  });
}

export async function getSchoolBySlug(slug: string): Promise<SchoolWithMeta | null> {
  const school = await prisma.school.findUnique({
    where: { slug },
    include: {
      comments: { select: { topic: true, sentiment: true, text: true, publishedAt: true } },
    },
  });
  if (!school) return null;

  const analysis = analyzeComments(
    school.comments.map((c) => ({
      topic: c.topic,
      sentiment: c.sentiment,
      text: c.text,
      publishedAt: c.publishedAt,
    })),
  );

  return {
    id: school.id,
    name: school.name,
    arabicName: school.arabicName,
    slug: school.slug,
    location: school.location,
    commentCount: school.comments.length,
    analysis,
  };
}

export type CommentRow = {
  id: string;
  text: string;
  topic: string;
  sentiment: string;
  publishedAt: Date;
};

export async function getCommentsForSchool(
  schoolId: string,
  filters?: { topic?: TopicKey; sentiment?: Sentiment },
): Promise<CommentRow[]> {
  return prisma.comment.findMany({
    where: {
      schoolId,
      ...(filters?.topic ? { topic: filters.topic } : {}),
      ...(filters?.sentiment ? { sentiment: filters.sentiment } : {}),
    },
    select: { id: true, text: true, topic: true, sentiment: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
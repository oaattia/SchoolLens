import {
  ALL_TOPICS,
  type OverallSentiment,
  type Sentiment,
  type TopicKey,
} from "./types";

type CommentRow = {
  topic: string;
  sentiment: string;
  text: string;
  publishedAt: Date;
};

export type SentimentBreakdown = {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
};

export type TopicStat = {
  topic: TopicKey;
  count: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  summary: string;
};

export type StrengthComplaint = { topic: TopicKey; count: number };

export type SchoolAnalysis = {
  totalComments: number;
  sentiment: SentimentBreakdown & {
    positivePct: number;
    neutralPct: number;
    negativePct: number;
  };
  overall: OverallSentiment;
  overallLabel: string;
  parentSummary: string;
  strengths: StrengthComplaint[];
  complaints: StrengthComplaint[];
  topics: TopicStat[];
};

function isTopic(s: string): s is TopicKey {
  return (ALL_TOPICS as string[]).includes(s);
}
function isSentiment(s: string): s is Sentiment {
  return s === "positive" || s === "neutral" || s === "negative";
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

export function classifyOverall(b: SentimentBreakdown): OverallSentiment {
  if (b.total === 0) return "mixed";
  if (b.positive > b.negative * 1.5) return "mostly_positive";
  if (b.negative > b.positive * 1.5) return "mostly_negative";
  return "mixed";
}

// Short auto-summary for a topic, based on its dominant sentiment.
function topicSummary(
  topicLabel: string,
  s: SentimentBreakdown,
  sentimentLabels: Record<Sentiment, string>,
): string {
  if (s.total === 0) return `لا توجد آراء كافية عن ${topicLabel}.`;
  const dominant = (["positive", "neutral", "negative"] as Sentiment[]).sort(
    (a, b2) => s[b2] - s[a],
  )[0];
  const pctVal = pct(s[dominant], s.total);
  if (dominant === "positive") {
    return `أغلب آراء الأهالي (${pctVal}%) إيجابية بخصوص ${topicLabel}.`;
  }
  if (dominant === "negative") {
    return `أغلب آراء الأهالي (${pctVal}%) سلبية بخصوص ${topicLabel}.`;
  }
  return `آراء الأهالية حول ${topicLabel} متوزعة بين الإيجابي والسلبي.`;
}

import { sentimentLabels, topicLabels } from "./types";

export function analyzeComments(comments: CommentRow[]): SchoolAnalysis {
  const totalComments = comments.length;

  const sentiment: SentimentBreakdown = {
    positive: 0,
    neutral: 0,
    negative: 0,
    total: totalComments,
  };

  const perTopic: Record<string, SentimentBreakdown & { texts: string[] }> = {};
  for (const t of ALL_TOPICS) {
    perTopic[t] = { positive: 0, neutral: 0, negative: 0, total: 0, texts: [] };
  }

  for (const c of comments) {
    const s = isSentiment(c.sentiment) ? c.sentiment : "neutral";
    sentiment[s]++;
    sentiment.total = totalComments;

    if (isTopic(c.topic)) {
      perTopic[c.topic][s]++;
      perTopic[c.topic].total++;
      perTopic[c.topic].texts.push(c.text);
    }
  }

  const topics: TopicStat[] = ALL_TOPICS.filter((t) => perTopic[t].total > 0)
    .map((t) => {
      const s = perTopic[t];
      return {
        topic: t,
        count: s.total,
        positive: s.positive,
        neutral: s.neutral,
        negative: s.negative,
        positivePct: pct(s.positive, s.total),
        neutralPct: pct(s.neutral, s.total),
        negativePct: pct(s.negative, s.total),
        summary: topicSummary(topicLabels[t], s, sentimentLabels),
      };
    })
    .sort((a, b) => b.count - a.count);

  const strengths: StrengthComplaint[] = topics
    .filter((t) => t.positive >= t.negative && t.positive > 0)
    .sort((a, b) => b.positive - a.positive)
    .slice(0, 5)
    .map((t) => ({ topic: t.topic, count: t.positive }));

  const complaints: StrengthComplaint[] = topics
    .filter((t) => t.negative > 0)
    .sort((a, b) => b.negative - a.negative)
    .slice(0, 5)
    .map((t) => ({ topic: t.topic, count: t.negative }));

  const overall = classifyOverall(sentiment);
  const overallLabel =
    overall === "mostly_positive"
      ? "إيجابي غالبًا"
      : overall === "mostly_negative"
        ? "سلبي غالبًا"
        : "آراء مختلطة";

  const parentSummary = buildParentSummary(strengths, complaints, totalComments);

  return {
    totalComments,
    sentiment: {
      ...sentiment,
      positivePct: pct(sentiment.positive, totalComments),
      neutralPct: pct(sentiment.neutral, totalComments),
      negativePct: pct(sentiment.negative, totalComments),
    },
    overall,
    overallLabel,
    parentSummary,
    strengths,
    complaints,
    topics,
  };
}

function buildParentSummary(
  strengths: StrengthComplaint[],
  complaints: StrengthComplaint[],
  total: number,
): string {
  if (total === 0) {
    return "لا توجد آراء كافية من أولياء الأمور عن هذه المدرسة حتى الآن.";
  }
  const sLabels = strengths.slice(0, 3).map((s) => topicLabels[s.topic]);
  const cLabels = complaints.slice(0, 3).map((c) => topicLabels[c.topic]);

  const parts: string[] = [];
  if (sLabels.length) {
    parts.push(`أغلب آراء الأهالي إيجابية بخصوص ${sLabels.join(" و")}`);
  }
  if (cLabels.length) {
    parts.push(`بينما تتكرر بعض الشكاوى بخصوص ${cLabels.join(" و")}`);
  }
  if (parts.length === 0) {
    return `بناءً على ${total} رأيًا من أولياء الأمور، الآراء متوزعة بين الإيجابي والسلبي.`;
  }
  return `${parts.join("، ")}. (بناءً على ${total} رأيًا من أولياء الأمور)`;
}
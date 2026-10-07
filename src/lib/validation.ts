import { ALL_TOPICS, type Sentiment } from "./types";

// Validate the Hermes incoming comment payload.
// Returns { ok: true, value } or { ok: false, error }.
export type ParsedComment = {
  source: string;
  externalId: string;
  school: string;
  text: string;
  topic: string;
  sentiment: Sentiment;
  date: Date;
};

export type ValidationResult =
  | { ok: true; value: ParsedComment }
  | { ok: false; error: string };

const VALID_SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];

export function validateCommentInput(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "JSON body required" };
  }
  const b = raw as Record<string, unknown>;

  const source = typeof b.source === "string" ? b.source.trim() : "";
  if (!source) return { ok: false, error: "field 'source' is required" };

  const externalId =
    typeof b.external_id === "string" ? b.external_id.trim() : "";
  if (!externalId) return { ok: false, error: "field 'external_id' is required" };

  const school = typeof b.school === "string" ? b.school.trim() : "";
  if (!school) return { ok: false, error: "field 'school' is required" };

  const text = typeof b.comment === "string" ? b.comment.trim() : "";
  if (!text) return { ok: false, error: "field 'comment' is required" };

  const topic = typeof b.topic === "string" ? b.topic.trim() : "";
  if (!topic || !(ALL_TOPICS as string[]).includes(topic)) {
    return {
      ok: false,
      error: `field 'topic' must be one of: ${ALL_TOPICS.join(", ")}`,
    };
  }

  const sentiment = typeof b.sentiment === "string" ? b.sentiment.trim() : "";
  if (!VALID_SENTIMENTS.includes(sentiment as Sentiment)) {
    return {
      ok: false,
      error: "field 'sentiment' must be one of: positive, neutral, negative",
    };
  }

  // date: optional, default to now. Accept ISO strings and bare dates.
  let date = new Date();
  if (b.date !== undefined && b.date !== null && b.date !== "") {
    const d = new Date(typeof b.date === "string" ? b.date : String(b.date));
    if (Number.isNaN(d.getTime())) {
      return { ok: false, error: "field 'date' must be a valid date (YYYY-MM-DD or ISO)" };
    }
    date = d;
  }

  return {
    ok: true,
    value: {
      source,
      externalId,
      school,
      text,
      topic,
      sentiment: sentiment as Sentiment,
      date,
    },
  };
}
"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommentRow } from "@/lib/data";
import { sentimentLabels, topicLabels, type TopicKey } from "@/lib/types";
import CommentItem from "./CommentItem";

interface CommentListProps {
  schoolId: string;
  comments: CommentRow[];
  allTopics: TopicKey[];
  selectedTopic: TopicKey | "all";
  onSelectTopic: (topic: TopicKey | "all") => void;
}

type Period = "all" | "month" | "quarter" | "half";

type SentimentFilter = "all" | "positive" | "neutral" | "negative";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(d);
}

function withinPeriod(d: Date, period: Period) {
  if (period === "all") return true;
  const now = Date.now();
  const t = d.getTime();
  const ms =
    period === "month"
      ? 30 * 24 * 60 * 60 * 1000
      : period === "quarter"
        ? 90 * 24 * 60 * 60 * 1000
        : 180 * 24 * 60 * 60 * 1000;
  return now - t <= ms;
}

export default function CommentList({
  comments,
  allTopics,
  selectedTopic,
  onSelectTopic,
}: CommentListProps) {
  const [sentiment, setSentiment] = useState<SentimentFilter>("all");
  const [period, setPeriod] = useState<Period>("all");

  useEffect(() => {
    if (selectedTopic !== "all" && !allTopics.includes(selectedTopic)) {
      onSelectTopic("all");
    }
  }, [allTopics, selectedTopic, onSelectTopic]);

  const filtered = useMemo(() => {
    return comments.filter((c) => {
      const topicMatch = selectedTopic === "all" || c.topic === selectedTopic;
      const sentimentMatch = sentiment === "all" || c.sentiment === sentiment;
      const periodMatch = withinPeriod(c.publishedAt, period);
      return topicMatch && sentimentMatch && periodMatch;
    });
  }, [comments, selectedTopic, sentiment, period]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="topic-filter" className="text-xs font-semibold text-slate-500">
            الموضوع
          </label>
          <select
            id="topic-filter"
            value={selectedTopic}
            onChange={(e) => onSelectTopic(e.target.value as TopicKey | "all")}
            className="min-w-[10rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="all">كل المواضيع</option>
            {allTopics.map((t) => (
              <option key={t} value={t}>
                {topicLabels[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="sentiment-filter" className="text-xs font-semibold text-slate-500">
            الآراء
          </label>
          <select
            id="sentiment-filter"
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value as SentimentFilter)}
            className="min-w-[8rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="all">كل الآراء</option>
            <option value="positive">{sentimentLabels.positive}</option>
            <option value="neutral">{sentimentLabels.neutral}</option>
            <option value="negative">{sentimentLabels.negative}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="period-filter" className="text-xs font-semibold text-slate-500">
            الفترة
          </label>
          <select
            id="period-filter"
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="min-w-[8rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="all">كل الفترات</option>
            <option value="month">آخر شهر</option>
            <option value="quarter">آخر 3 أشهر</option>
            <option value="half">آخر 6 أشهر</option>
          </select>
        </div>

        <p className="me-auto text-sm text-slate-600">
          {filtered.length} رأي من {comments.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          لا توجد آراء مطابقة للفلتر الحالي
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              dateFormatted={formatDate(comment.publishedAt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

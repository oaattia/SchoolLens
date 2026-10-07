"use client";

import { useState } from "react";
import type { TopicStat } from "@/lib/analysis";
import type { CommentRow } from "@/lib/data";
import type { TopicKey } from "@/lib/types";
import TopicCard from "./TopicCard";
import CommentList from "./CommentList";

export default function SchoolDashboard({
  schoolId,
  topics,
  comments,
}: {
  schoolId: string;
  topics: TopicStat[];
  comments: CommentRow[];
}) {
  const [selectedTopic, setSelectedTopic] = useState<TopicKey | "all">("all");

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          الآراء حسب الموضوع
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard
              key={topic.topic}
              topic={topic}
              selected={selectedTopic === topic.topic}
              onClick={() => setSelectedTopic(topic.topic)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">آراء الأهالي</h2>
        <CommentList
          schoolId={schoolId}
          comments={comments}
          allTopics={topics.map((t) => t.topic)}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
        />
      </section>
    </div>
  );
}

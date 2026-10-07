// Shared types for SchoolLens.

export type Sentiment = "positive" | "neutral" | "negative";

// Canonical topic keys. UI maps these to Arabic labels via topicLabels.
export type TopicKey =
  | "academics"
  | "teachers"
  | "english"
  | "administration"
  | "communication"
  | "fees"
  | "transport"
  | "activities"
  | "class_size"
  | "bullying"
  | "cleanliness"
  | "discipline"
  | "homework"
  | "academic_pressure";

export const ALL_TOPICS: TopicKey[] = [
  "academics",
  "teachers",
  "english",
  "administration",
  "communication",
  "fees",
  "transport",
  "activities",
  "class_size",
  "bullying",
  "cleanliness",
  "discipline",
  "homework",
  "academic_pressure",
];

export const topicLabels: Record<TopicKey, string> = {
  academics: "المستوى الدراسي",
  teachers: "المدرسين",
  english: "الإنجليزي",
  administration: "الإدارة",
  communication: "التواصل",
  fees: "المصاريف",
  transport: "الباص",
  activities: "الأنشطة",
  class_size: "كثافة الفصول",
  bullying: "التنمر",
  cleanliness: "النظافة",
  discipline: "الانضباط",
  homework: "الواجبات",
  academic_pressure: "الضغط الدراسي",
};

export const sentimentLabels: Record<Sentiment, string> = {
  positive: "إيجابي",
  neutral: "محايد",
  negative: "سلبي",
};

export const overallSentimentLabels = {
  mostly_positive: "إيجابي غالبًا",
  mixed: "آراء مختلطة",
  mostly_negative: "سلبي غالبًا",
} as const;

export type OverallSentiment = keyof typeof overallSentimentLabels;
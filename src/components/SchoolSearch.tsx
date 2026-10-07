"use client";

import { useMemo, useState } from "react";
import type { SchoolWithMeta } from "@/lib/data";
import SchoolCard from "./SchoolCard";

export default function SchoolSearch({ schools }: { schools: SchoolWithMeta[] }) {
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalized) return schools;
    return schools.filter((s) => {
      const name = s.name.toLowerCase();
      const arabicName = (s.arabicName ?? "").toLowerCase();
      const location = s.location.toLowerCase();
      return (
        name.includes(normalized) ||
        arabicName.includes(normalized) ||
        location.includes(normalized)
      );
    });
  }, [schools, normalized]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <label htmlFor="school-search" className="sr-only">
          ابحث عن مدرسة
        </label>
        <input
          id="school-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن مدرسة"
          className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-lg text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          لا توجد مدارس مطابقة لـ “{query}”
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      )}
    </div>
  );
}

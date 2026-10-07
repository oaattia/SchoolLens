import { listSchools } from "@/lib/data";
import SchoolSearch from "@/components/SchoolSearch";
import SiteHeader from "@/components/SiteHeader";

// DB-backed page — render fresh per request, never statically prerender
// (would crash at build time when no DATABASE_URL/DB is available).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const schools = await listSchools();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-extrabold text-brand-700 sm:text-4xl">
            SchoolLens
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            افهم آراء أولياء الأمور عن المدارس
          </p>
        </section>

        <section className="mb-6">
          <h2 className="sr-only">البحث عن مدرسة</h2>
          <SchoolSearch schools={schools} />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          هذا الموقع يعرض آراء أولياء الأمور المنشورة علنًا، وليس تصنيفًا رسميًا
          للمدارس.
        </div>
      </footer>
    </div>
  );
}

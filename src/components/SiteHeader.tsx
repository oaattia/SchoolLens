import Link from "next/link";

export default function SiteHeader({ backHref }: { backHref?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {backHref ? (
          <Link
            href={backHref}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
          >
            العودة للبحث
          </Link>
        ) : (
          <span aria-hidden="true" className="w-20" />
        )}

        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-brand-700">
            SchoolLens
          </span>
        </Link>

        <span aria-hidden="true" className="w-20" />
      </div>
    </header>
  );
}

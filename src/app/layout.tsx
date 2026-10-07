import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SchoolLens — آراء أولياء الأمور عن المدارس",
  description:
    "SchoolLens帮你 تفهم آراء أولياء الأمور عن المدارس في مصر. ابحث عن مدرسة واقرأ ما يقوله الأهالي عن المستوى الدراسي والمدرسين والمصاريف وغيرها.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
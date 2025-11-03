import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kiwoom Securities Mock Trading",
  description:
    "Kiwoom Securities REST API 기반 실시간 주식 차트 웹 애플리케이션의 모의 환경"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}

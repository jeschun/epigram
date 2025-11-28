import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import HeaderGate from "@/components/HeaderGate";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Epigram",
  description: "Share your favorite epigrams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 로그인/회원가입을 제외한 모든 페이지에서 헤더 노출 */}
        <HeaderGate />
        <main className="min-h-dvh bg-[#fbfcfe]">{children}</main>
      </body>
    </html>
  );
}

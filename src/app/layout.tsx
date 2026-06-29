import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC, Inter } from "next/font/google";
import "./globals.css";
import { AppWrapper } from "@/components/layout/AppWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoSans = Noto_Sans_SC({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "蔡宇翔 — ARCHITECT",
  description: "蔡宇翔的个人作品集 — 建筑设计 · ZINE · 图文",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${notoSans.variable} ${notoSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}

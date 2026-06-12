import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import FeedbackButton from "@/components/FeedbackButton";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "KiraPrep — Practice MBA Kira Video Interviews",
  description:
    "Practice real MBA Kira video essay questions with timed practice mode. 194+ questions sourced from Reddit and MBA applicants for INSEAD, Kellogg, Oxford, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#111] font-[family-name:var(--font-dm-sans)]">
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}

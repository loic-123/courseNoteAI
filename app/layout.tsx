import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CourseNotes AI - Transform Your Lectures into Study Materials",
  description: "Generate comprehensive notes, interactive quizzes, and visual study sheets from your course materials using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

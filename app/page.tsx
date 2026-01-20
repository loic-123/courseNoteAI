'use client';

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { FileText, CheckCircle, Palette, Zap, Brain } from "lucide-react";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900" />
});

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Hero Section */}
      <main className="flex-1 relative">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              AI-Powered Study Materials
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Transform Your Lectures
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Into Knowledge
              </span>
            </h1>

            <p className="mt-8 text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Upload your course materials and get comprehensive notes, interactive quizzes,
              and beautiful visual summaries — all generated in minutes.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/generate"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">Start Generating Free</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
              </Link>
              <Link
                href="/gallery"
                className="px-8 py-4 rounded-xl font-semibold text-lg border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 transition-all duration-300"
              >
                Browse Gallery
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-sm text-slate-500">Free to Use</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">3-in-1</div>
                <div className="text-sm text-slate-500">Study Materials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">&lt;2min</div>
                <div className="text-sm text-slate-500">Generation Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative bg-slate-900/50 backdrop-blur-xl border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Ace Your Exams</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Our AI analyzes your course materials and generates comprehensive study resources tailored to your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FileText className="h-8 w-8" />}
                title="Comprehensive Notes"
                description="Detailed markdown notes with clear structure, key concepts highlighted, and LaTeX math support."
                gradient="from-blue-500 to-blue-600"
              />
              <FeatureCard
                icon={<CheckCircle className="h-8 w-8" />}
                title="Interactive Quizzes"
                description="10-15 questions per topic with detailed explanations. Track your progress and improve."
                gradient="from-purple-500 to-purple-600"
              />
              <FeatureCard
                icon={<Palette className="h-8 w-8" />}
                title="Visual Summaries"
                description="AI-generated infographics that help you visualize and remember key concepts."
                gradient="from-cyan-500 to-cyan-600"
              />
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Upload Materials"
              description="Drop your PDFs, Word docs, or text files. We support multiple formats."
            />
            <StepCard
              number="2"
              title="Configure Options"
              description="Choose detail level, language, and add custom instructions if needed."
            />
            <StepCard
              number="3"
              title="Get Results"
              description="Receive comprehensive notes, quizzes, and visuals in under 2 minutes."
            />
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-all duration-300"
            >
              <Brain className="h-5 w-5" />
              Try It Now
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">CourseNotes AI</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 CourseNotes AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
    </div>
  );
}

function StepCard({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-2xl font-bold text-blue-400 mb-6">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

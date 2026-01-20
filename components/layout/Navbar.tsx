'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CourseNotes AI
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/gallery"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Courses
            </Link>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0">
              <Link href="/generate" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Notes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

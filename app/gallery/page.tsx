'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Eye, Search, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Note } from '@/types';

export default function GalleryPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');
  const [language, setLanguage] = useState('all');

  useEffect(() => {
    fetchNotes();
  }, [sort, language]);

  async function fetchNotes() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sort !== 'all') params.append('sort', sort);
      if (language !== 'all') params.append('language', language);

      const response = await fetch(`/api/notes?${params.toString()}`);
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Public{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Browse study materials created by students from top universities
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-400">Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Sort by</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
            <p className="text-slate-400">Loading notes...</p>
          </div>
        )}

        {/* Notes Grid */}
        {!loading && notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => {
              const course = Array.isArray(note.courses) ? note.courses[0] : note.courses;
              const institution = course?.institutions
                ? Array.isArray(course.institutions)
                  ? course.institutions[0]
                  : course.institutions
                : null;

              return (
                <Link key={note.id} href={`/notes/${note.id}`}>
                  <Card className="group h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      {/* Thumbnail */}
                      {note.visual_image_url ? (
                        <div className="relative w-full h-48 bg-slate-800">
                          <Image
                            src={note.visual_image_url}
                            alt={note.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                            <Search className="h-8 w-8 text-blue-400" />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex gap-2 mb-3">
                          {course && (
                            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                              {course.code}
                            </span>
                          )}
                          {institution && (
                            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20">
                              {institution.short_name}
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {note.title}
                        </h3>

                        <p className="text-sm text-slate-500 mb-4">
                          By {note.creator_name}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 pt-3 border-t border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{note.upvotes}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            <span>{note.views_count}</span>
                          </div>
                          <div className="ml-auto text-slate-600">
                            {new Date(note.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && notes.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
              <Search className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
            <p className="text-slate-400 mb-6">
              Be the first to create study materials!
            </p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
              <Link href="/generate">Generate Notes</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

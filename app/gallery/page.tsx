'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, Eye } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Public Gallery</h1>
        <p className="text-muted-foreground mb-8">
          Browse study materials created by students from top universities
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Sort by</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="recent">Most Recent</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notes...</p>
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
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      {/* Thumbnail */}
                      {note.visual_image_url && (
                        <div className="relative w-full h-48 bg-muted">
                          <Image
                            src={note.visual_image_url}
                            alt={note.title}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex gap-2 mb-2">
                          {course && (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {course.code}
                            </span>
                          )}
                          {institution && (
                            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                              {institution.short_name}
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {note.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-3">
                          By {note.creator_name}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {note.upvotes}
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {note.views_count}
                          </div>
                          <div className="ml-auto">
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
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No notes found. Be the first to create one!
            </p>
            <Button asChild>
              <Link href="/generate">Generate Notes</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

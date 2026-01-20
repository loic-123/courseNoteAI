'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Course, Institution } from '@/types';
import { BookOpen, GraduationCap, ChevronRight, FileText } from 'lucide-react';

export default function CoursesPage() {
  const [coursesByInstitution, setCoursesByInstitution] = useState<
    Record<string, { institution: Institution; courses: Course[] }>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        const courses = data.courses || [];

        // Group by institution
        const grouped: Record<string, { institution: Institution; courses: Course[] }> = {};
        courses.forEach((course: any) => {
          const inst = Array.isArray(course.institutions)
            ? course.institutions[0]
            : course.institutions;
          if (inst) {
            if (!grouped[inst.id]) {
              grouped[inst.id] = { institution: inst, courses: [] };
            }
            grouped[inst.id].courses.push(course);
          }
        });

        setCoursesByInstitution(grouped);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
          <p className="text-slate-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Courses
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Explore courses with available study materials
          </p>
        </div>

        <div className="space-y-8">
          {Object.values(coursesByInstitution).map(({ institution, courses }) => (
            <Card key={institution.id} className="bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-slate-800">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl">{institution.name}</div>
                    <div className="text-sm text-slate-400 font-normal">{institution.short_name}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/gallery?course_id=${course.id}`}
                      className="group flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            <span className="text-blue-400">{course.code}</span>
                            <span className="text-slate-500 mx-2">-</span>
                            {course.name}
                          </div>
                          {course.description && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                              {course.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full text-sm">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-400">{course.notes_count || 0} notes</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {Object.keys(coursesByInstitution).length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
                <BookOpen className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No courses available</h3>
              <p className="text-slate-400">
                Courses will appear here once notes are generated.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

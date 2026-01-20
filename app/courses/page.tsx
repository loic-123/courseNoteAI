'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Course, Institution } from '@/types';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Browse Courses</h1>
        <p className="text-muted-foreground mb-8">
          Explore courses with available study materials
        </p>

        <div className="space-y-8">
          {Object.values(coursesByInstitution).map(({ institution, courses }) => (
            <Card key={institution.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  {institution.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/gallery?course_id=${course.id}`}
                      className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">
                            {course.code} - {course.name}
                          </div>
                          {course.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {course.description}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {course.notes_count || 0} notes
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {Object.keys(coursesByInstitution).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

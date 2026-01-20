import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Type for course data from API
interface CourseData {
  id: string;
  institution_id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  institutions?: {
    id: string;
    name: string;
    short_name: string;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const institutionId = searchParams.get('institution_id');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('courses')
    .select(`
      *,
      institutions (
        id,
        name,
        short_name
      )
    `)
    .order('name');

  if (institutionId) {
    query = query.eq('institution_id', institutionId);
  }

  const { data, error } = await query as { data: CourseData[] | null; error: unknown };

  if (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  // Get notes count for each course
  const coursesWithCount = await Promise.all(
    (data || []).map(async (course) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase as any)
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      return {
        ...course,
        notes_count: count || 0,
      };
    })
  );

  return NextResponse.json({ courses: coursesWithCount });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const institutionId = body.institutionId as string;
  const code = body.code as string;
  const name = body.name as string;
  const description = body.description as string | undefined;

  if (!institutionId || !code || !name) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('courses')
    .insert({
      institution_id: institutionId,
      code: code,
      name: name,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const institutionId = searchParams.get('institution_id');

  let query = supabase
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

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get notes count for each course
  const coursesWithCount = await Promise.all(
    (data || []).map(async (course) => {
      const { count } = await supabase
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
  const { institutionId, code, name, description } = await request.json();

  if (!institutionId || !code || !name) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('courses')
    .insert({
      institution_id: institutionId,
      code,
      name,
      description,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

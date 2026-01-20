import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const institutionId = searchParams.get('institution_id');
  const courseId = searchParams.get('course_id');
  const language = searchParams.get('language');
  const sort = searchParams.get('sort') || 'recent';
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('notes')
    .select(`
      id,
      title,
      creator_name,
      language,
      visual_image_url,
      upvotes,
      downvotes,
      views_count,
      created_at,
      updated_at,
      courses (
        id,
        code,
        name,
        institutions (
          id,
          name,
          short_name
        )
      ),
      modules (
        id,
        name
      )
    `);

  // Apply filters
  if (institutionId) {
    query = query.eq('courses.institution_id', institutionId);
  }
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  if (language) {
    query = query.eq('language', language);
  }

  // Apply sorting
  switch (sort) {
    case 'upvotes':
      query = query.order('upvotes', { ascending: false });
      break;
    case 'views':
      query = query.order('views_count', { ascending: false });
      break;
    default: // recent
      query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    notes: data,
    total: count || 0,
    limit,
    offset,
  });
}

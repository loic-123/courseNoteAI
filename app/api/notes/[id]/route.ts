import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { deleteImageFromStorage } from '@/lib/supabase/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      courses (
        id,
        code,
        name,
        description,
        institutions (
          id,
          name,
          short_name
        )
      ),
      modules (
        id,
        name,
        description
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Increment view count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc('increment_view_count', { note_uuid: id });

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { adminPassword } = body;

    // Verify admin password
    const expectedPassword = process.env.ADMIN_PASSWORD;
    if (!expectedPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured on server' },
        { status: 500 }
      );
    }

    if (adminPassword !== expectedPassword) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      );
    }

    // Get the note first to retrieve the visual URL for cleanup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: note, error: fetchError } = await (supabase as any)
      .from('notes')
      .select('visual_image_url')
      .eq('id', id)
      .single() as { data: { visual_image_url: string | null } | null; error: unknown };

    if (fetchError) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Delete associated image from storage if it exists
    if (note?.visual_image_url) {
      try {
        await deleteImageFromStorage(note.visual_image_url);
      } catch (storageError) {
        console.error('Failed to delete image from storage:', storageError);
        // Continue with note deletion even if image deletion fails
      }
    }

    // Delete the note
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete note: ' + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

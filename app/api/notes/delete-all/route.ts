import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminPassword } = body;

    // Verify admin password
    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      );
    }

    // Get all notes to delete their visuals from storage
    const { data: notes, error: fetchError } = await supabase
      .from('notes')
      .select('id, visual_image_url');

    if (fetchError) {
      console.error('Error fetching notes:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    // Delete visual images from storage
    const visualPaths: string[] = [];
    for (const note of notes || []) {
      if (note.visual_image_url && note.visual_image_url.includes('supabase')) {
        // Extract the file path from the URL
        const urlParts = note.visual_image_url.split('/visuals/');
        if (urlParts[1]) {
          visualPaths.push(urlParts[1]);
        }
      }
    }

    if (visualPaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('visuals')
        .remove(visualPaths);

      if (storageError) {
        console.warn('Warning: Could not delete some visual files:', storageError);
      }
    }

    // Delete all notes from database
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (workaround for Supabase)

    if (deleteError) {
      console.error('Error deleting notes:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${notes?.length || 0} notes`,
      deletedCount: notes?.length || 0,
    });
  } catch (error) {
    console.error('Delete all error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

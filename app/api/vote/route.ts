import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import crypto from 'crypto';

function getUserIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// Type for vote data
interface VoteData {
  id: string;
  vote_type: 'up' | 'down';
}

interface NoteData {
  upvotes: number;
  downvotes: number;
}

export async function POST(request: NextRequest) {
  const { noteId, voteType } = await request.json();

  if (!noteId || !voteType || !['up', 'down'].includes(voteType)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const userIdentifier = getUserIdentifier(request);

  // Check if user already voted
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingVote } = await (supabase as any)
    .from('votes')
    .select('id, vote_type')
    .eq('note_id', noteId)
    .eq('user_identifier', userIdentifier)
    .single() as { data: VoteData | null };

  if (existingVote) {
    // Update existing vote
    if (existingVote.vote_type !== voteType) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);

      // Update note counts
      const increment = voteType === 'up' ? 1 : -1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).rpc('update_vote_counts', {
        note_uuid: noteId,
        upvotes_delta: increment,
        downvotes_delta: -increment,
      });
    }
  } else {
    // Insert new vote
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('votes').insert({
      note_id: noteId,
      user_identifier: userIdentifier,
      vote_type: voteType,
    });

    // Update note counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    if (voteType === 'up') {
      await db
        .from('notes')
        .update({ upvotes: db.raw('upvotes + 1') })
        .eq('id', noteId);
    } else {
      await db
        .from('notes')
        .update({ downvotes: db.raw('downvotes + 1') })
        .eq('id', noteId);
    }
  }

  // Fetch updated counts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: note } = await (supabase as any)
    .from('notes')
    .select('upvotes, downvotes')
    .eq('id', noteId)
    .single() as { data: NoteData | null };

  return NextResponse.json({
    success: true,
    upvotes: note?.upvotes || 0,
    downvotes: note?.downvotes || 0,
  });
}

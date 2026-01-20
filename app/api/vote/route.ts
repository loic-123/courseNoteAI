import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import crypto from 'crypto';

function getUserIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export async function POST(request: NextRequest) {
  const { noteId, voteType } = await request.json();

  if (!noteId || !voteType || !['up', 'down'].includes(voteType)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const userIdentifier = getUserIdentifier(request);

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id, vote_type')
    .eq('note_id', noteId)
    .eq('user_identifier', userIdentifier)
    .single();

  if (existingVote) {
    // Update existing vote
    if (existingVote.vote_type !== voteType) {
      await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);

      // Update note counts
      const increment = voteType === 'up' ? 1 : -1;
      await supabase.rpc('update_vote_counts', {
        note_uuid: noteId,
        upvotes_delta: increment,
        downvotes_delta: -increment,
      });
    }
  } else {
    // Insert new vote
    await supabase.from('votes').insert({
      note_id: noteId,
      user_identifier: userIdentifier,
      vote_type: voteType,
    });

    // Update note counts
    if (voteType === 'up') {
      await supabase
        .from('notes')
        .update({ upvotes: supabase.raw('upvotes + 1') })
        .eq('id', noteId);
    } else {
      await supabase
        .from('notes')
        .update({ downvotes: supabase.raw('downvotes + 1') })
        .eq('id', noteId);
    }
  }

  // Fetch updated counts
  const { data: note } = await supabase
    .from('notes')
    .select('upvotes, downvotes')
    .eq('id', noteId)
    .single();

  return NextResponse.json({
    success: true,
    upvotes: note?.upvotes || 0,
    downvotes: note?.downvotes || 0,
  });
}

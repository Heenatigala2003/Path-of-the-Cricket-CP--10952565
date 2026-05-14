import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get('gender') as 'boys' | 'girls' | null;
  if (!gender) return NextResponse.json({ error: 'Gender required' }, { status: 400 });

  const { count: total, error: totalErr } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('gender', gender);
  const { count: completed, error: compErr } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('gender', gender)
    .eq('status', 'completed');
  const { count: upcoming, error: upErr } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('gender', gender)
    .eq('status', 'scheduled');

  if (totalErr || compErr || upErr) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({
    total_matches: total || 0,
    completed_matches: completed || 0,
    upcoming_matches: upcoming || 0,
    total_provinces: 9,
  });
}
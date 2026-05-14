
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('players')
      .select('gender')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ exists: !!data, gender: data?.gender });
  } catch (error) {
    console.error('Check exists error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
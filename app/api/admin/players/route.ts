import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get('gender');
    const district = searchParams.get('district');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('players')
      .select(`
        *,
        district_selections(*),
        annual_selections(*),
        profiles:player_profiles!player_id(*)
      `);

    if (gender) query = query.eq('gender', gender);
    if (district) query = query.eq('district', district);
    if (status) query = query.eq('district_selections.status', status);
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    const players = (data || []).map((p: any) => ({
      ...p,
      district_selections: p.district_selections?.[0] || null,
      annual_selections: p.annual_selections?.[0] || null,
      profiles: p.profiles?.[0] || null,
    }));

    return NextResponse.json(players);
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
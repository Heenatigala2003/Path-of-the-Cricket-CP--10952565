
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, district, primary_role, gender } = body;

   
    if (!full_name || !email || !district || !primary_role || !gender) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }


    const { data: existing } = await supabaseAdmin
      .from('players')
      .select('id, gender')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Email already registered as ${existing.gender === 'male' ? 'Boy' : 'Girl'}` },
        { status: 409 }
      );
    }


    const { count, error: countError } = await supabaseAdmin
      .from('district_selections')
      .select('*', { count: 'exact', head: true })
      .eq('district', district)
      .eq('gender', gender)
      .in('status', ['REGISTERED', 'SELECTED']);

    if (countError) throw countError;

    const { data: capData } = await supabaseAdmin
      .from('district_capacity')
      .select('max_capacity')
      .eq('district', district)
      .eq('gender', gender)
      .single();

    if (!capData) throw new Error('District capacity not found');

    const currentCount = count || 0;
    if (currentCount >= capData.max_capacity) {
      return NextResponse.json(
        { error: `District full for ${gender === 'male' ? 'boys' : 'girls'}` },
        { status: 400 }
      );
    }

    
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .insert({ full_name, email, district, primary_role, gender })
      .select('id')
      .single();

    if (playerError) throw playerError;

   
    const { error: districtError } = await supabaseAdmin
      .from('district_selections')
      .insert({
        player_id: player.id,
        district,
        gender,
        status: 'REGISTERED',
        registered_at: new Date().toISOString(),
      });

    if (districtError) throw districtError;


    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: player.id });

    if (profileError) throw profileError;


    const { error: annualError } = await supabaseAdmin
      .from('annual_selections')
      .insert({
        player_id: player.id,
        status: 'NOT_YET_ELIGIBLE',
        profile_access: 'DENIED',
        year: new Date().getFullYear(),
      });

    if (annualError) throw annualError;

    return NextResponse.json({ success: true, playerId: player.id });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
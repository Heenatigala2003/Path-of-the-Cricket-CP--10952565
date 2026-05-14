import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const gender = searchParams.get('gender') as 'male' | 'female' | null;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('players')
      .select('*')
      .eq('email', email);
    if (gender) {
      query = query.eq('gender', gender);
    }

    const { data: player, error: playerError } = await query.maybeSingle();

    if (playerError) {
      console.error('Player fetch error:', playerError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }


    const { data: selection, error: selectionError } = await supabaseAdmin
      .from('district_selections')
      .select('*')
      .eq('player_id', player.id)
      .maybeSingle();

    if (selectionError) {
      console.error('District selection fetch error:', selectionError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }


    const { data: annual, error: annualError } = await supabaseAdmin
      .from('annual_selections')
      .select('*')
      .eq('player_id', player.id)
      .eq('year', new Date().getFullYear())
      .maybeSingle();

    if (annualError) {
      console.error('Annual selection fetch error:', annualError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }


    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', player.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      player,
      selection,
      annual,
      profile,
    });
  } catch (error) {
    console.error('Unexpected GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { playerId, gender, primary_role, profileData } = body;

    if (!playerId || !gender || !profileData) {
      return NextResponse.json(
        { error: 'Missing required fields: playerId, gender, profileData' },
        { status: 400 }
      );
    }

   
    const requiredProfileFields = [
      'batting_points',
      'bowling_points',
      'annual_rank',
      'height',
      'weight',
      'school',
      'date_of_birth',
      'preferred_format',
    ];
    for (const field of requiredProfileFields) {
      if (profileData[field] === undefined) {
        return NextResponse.json(
          { error: `Missing profile field: ${field}` },
          { status: 400 }
        );
      }
    }

    const { data: annual, error: annualError } = await supabaseAdmin
      .from('annual_selections')
      .select('profile_access')
      .eq('player_id', playerId)
      .eq('year', new Date().getFullYear())
      .maybeSingle();

    if (annualError) {
      console.error('Annual selection fetch error:', annualError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!annual) {
      return NextResponse.json(
        { error: 'No annual selection found for the current year' },
        { status: 403 }
      );
    }

    if (annual.profile_access !== 'ACCESS_GRANTED') {
      return NextResponse.json(
        { error: 'Profile access not granted' },
        { status: 403 }
      );
    }


    if (primary_role) {
      const { error: roleError } = await supabaseAdmin
        .from('players')
        .update({ primary_role })
        .eq('id', playerId);

      if (roleError) {
        console.error('Role update error:', roleError);
        return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
      }
    }


    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: playerId,
        batting_points: profileData.batting_points,
        bowling_points: profileData.bowling_points,
        annual_rank: profileData.annual_rank,
        height: profileData.height,
        weight: profileData.weight,
        school: profileData.school,
        dob: profileData.date_of_birth,
        preferred_format: profileData.preferred_format,
        avatar_url: profileData.avatar_url,
        matches: profileData.matches,
        runs: profileData.runs,
        wickets: profileData.wickets,
        best_bowling: profileData.best_bowling,
        batting_strike_rate: profileData.batting_strike_rate,
        bowling_economy: profileData.bowling_economy,
        highest_score: profileData.highest_score,
        fifties: profileData.fifties,
        hundreds: profileData.hundreds,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error('Profile upsert error:', upsertError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
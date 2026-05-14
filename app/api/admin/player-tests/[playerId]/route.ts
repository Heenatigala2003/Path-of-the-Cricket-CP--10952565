import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';

/* ================= UPDATE SELECTION STATUS ================= */
async function updatePlayerSelectionStatus(playerId: string) {
  const { data: player, error: playerError } = await supabaseAdmin
    .from('players')
    .select('id, primary_role, email, full_name')
    .eq('id', playerId)
    .single();

  if (playerError || !player) {
    throw new Error('Player not found');
  }

  const year = new Date().getFullYear();

  const tables = [
    'fitness_tests',
    'medical_checks',
    'mental_quizzes',
    'batting_tests',
    'bowling_tests',
    'fielding_tests',
    'wicketkeeping_tests',
  ];

  const results: any = {};

  for (const table of tables) {
    const { data } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('player_id', playerId)
      .maybeSingle();

    results[table] = data || null;
  }

  let total = 0;
  const role = player.primary_role;

  if (results.fitness_tests?.passed) total += 20;
  if (results.mental_quizzes?.score) total += results.mental_quizzes.score;

  if (role === 'Batter') {
    total += results.batting_tests?.score || 0;
    total += results.fielding_tests?.score || 0;
  } else if (role === 'Bowler') {
    total += results.bowling_tests?.score || 0;
    total += results.fielding_tests?.score || 0;
  } else if (role === 'All-Rounder') {
    total += results.batting_tests?.score || 0;
    total += results.bowling_tests?.score || 0;
    total += results.fielding_tests?.score || 0;
  } else if (role === 'Wicket-Keeper') {
    total += results.batting_tests?.score || 0;
    total += results.fielding_tests?.score || 0;
    total += results.wicketkeeping_tests?.score || 0;
  }

  const fitnessPassed = results.fitness_tests?.passed || false;
  const medicalPassed = results.medical_checks?.passed || false;
  const isSelected = total >= 63 && fitnessPassed && medicalPassed;

  await supabaseAdmin
    .from('annual_selections')
    .upsert(
      {
        player_id: playerId,
        year,
        status: isSelected ? 'SELECTED' : 'NOT_SELECTED',
        profile_access: isSelected ? 'ACCESS_GRANTED' : 'DENIED',
        rank: null,
      },
      { onConflict: 'player_id,year' }
    );
}

/* ================= GET ================= */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params; // 👈 await params
    if (!playerId) {
      return NextResponse.json({}); // return empty object to avoid frontend error
    }

    const tables = [
      'fitness_tests',
      'medical_checks',
      'mental_quizzes',
      'batting_tests',
      'bowling_tests',
      'fielding_tests',
      'wicketkeeping_tests',
    ];

    const results: any = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .eq('player_id', playerId)
          .maybeSingle();

        if (error) {
          console.warn(`Error fetching ${table} for player ${playerId}:`, error.message);
          results[table] = null;
        } else {
          results[table] = data || null;
        }
      } catch (err: any) {
        console.warn(`Exception fetching ${table}:`, err.message);
        results[table] = null;
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Fatal error in GET test data:', error);
    return NextResponse.json({});
  }
}

/* ================= POST ================= */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params; // 👈 await params
    if (!playerId) {
      return NextResponse.json(
        { error: 'Missing player ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const upserts = [];

    if (body.fitness) {
      upserts.push(
        supabaseAdmin.from('fitness_tests').upsert({
          player_id: playerId,
          passed: body.fitness.passed,
          run_time_seconds: body.fitness.run_time_seconds ?? null,
          points: body.fitness.passed ? 20 : 0,
        })
      );
    }

    if (body.medical) {
      upserts.push(
        supabaseAdmin.from('medical_checks').upsert({
          player_id: playerId,
          passed: body.medical.passed,
          notes: body.medical.notes ?? null,
        })
      );
    }

    if (body.mental) {
      upserts.push(
        supabaseAdmin.from('mental_quizzes').upsert({
          player_id: playerId,
          score: body.mental.score ?? 0,
        })
      );
    }

    if (body.batting) {
      upserts.push(
        supabaseAdmin.from('batting_tests').upsert({
          player_id: playerId,
          score: body.batting.score ?? 0,
        })
      );
    }

    if (body.bowling) {
      upserts.push(
        supabaseAdmin.from('bowling_tests').upsert({
          player_id: playerId,
          score: body.bowling.score ?? 0,
        })
      );
    }

    if (body.fielding) {
      upserts.push(
        supabaseAdmin.from('fielding_tests').upsert({
          player_id: playerId,
          score: body.fielding.score ?? 0,
        })
      );
    }

    if (body.wicketkeeping) {
      upserts.push(
        supabaseAdmin.from('wicketkeeping_tests').upsert({
          player_id: playerId,
          score: body.wicketkeeping.score ?? 0,
        })
      );
    }

    const results = await Promise.all(upserts);

    const hasError = results.find((r) => r.error);
    if (hasError) throw hasError.error;

    await updatePlayerSelectionStatus(playerId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST TEST ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to save test data' },
      { status: 500 }
    );
  }
}
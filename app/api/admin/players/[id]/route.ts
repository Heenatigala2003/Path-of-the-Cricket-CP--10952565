import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playerId } = await params;
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { player, districtSelection, annualSelection, profile } = body;

    // district_selections සඳහා gender එක හොයාගන්න (අවශ්‍ය නම්)
    let gender = player?.gender;
    if (districtSelection && !gender) {
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('gender')
        .eq('id', playerId)
        .single();
      if (existingPlayer) gender = existingPlayer.gender;
    }

    // 1. players table update
    if (player) {
      const { error } = await supabase
        .from('players')
        .update({
          full_name: player.full_name,
          email: player.email,
          district: player.district,
          primary_role: player.primary_role,
          gender: player.gender,
        })
        .eq('id', playerId);
      if (error) throw error;
    }

    // 2. district_selections upsert
    if (districtSelection) {
      if (!gender) throw new Error('Gender required for district selection');
      const upsertData: any = {
        player_id: playerId,
        gender,
        status: districtSelection.status,
        district: player?.district || districtSelection.district,
        registered_at: districtSelection.registered_at || new Date().toISOString(),
        selected_at: districtSelection.status === 'SELECTED' ? new Date().toISOString() : null,
      };
      if (districtSelection.id) upsertData.id = districtSelection.id;
      const { error } = await supabase
        .from('district_selections')
        .upsert(upsertData, { onConflict: 'player_id' });
      if (error) throw error;
    }

    // 3. annual_selections upsert – year සහ profile_access set කරනවා
    if (annualSelection) {
      const profile_access = annualSelection.status === 'SELECTED' ? 'ACCESS_GRANTED' : 'DENIED';
      const upsertData: any = {
        player_id: playerId,
        year: new Date().getFullYear(),
        status: annualSelection.status,
        profile_access,
        rank: annualSelection.status === 'SELECTED' ? (annualSelection.rank || null) : null,
      };
      if (annualSelection.id) upsertData.id = annualSelection.id;
      const { error } = await supabase
        .from('annual_selections')
        .upsert(upsertData, { onConflict: 'player_id, year' });
      if (error) throw error;
    }

    // 4. player_profiles upsert
    if (profile) {
      const { id, ...profileData } = profile;
      const { error } = await supabase
        .from('player_profiles')
        .upsert({ player_id: playerId, ...profileData }, { onConflict: 'player_id' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
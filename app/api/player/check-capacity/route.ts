
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase-admin';

export async function POST(request: Request) {
  try {
    const { district, gender } = await request.json();
    if (!district || !gender) {
      return NextResponse.json({ error: 'District and gender required' }, { status: 400 });
    }

    const { data: capData, error: capError } = await supabaseAdmin
      .from('district_capacity')
      .select('max_capacity')
      .eq('district', district)
      .eq('gender', gender)
      .single();

    if (capError) throw capError;

    
    const { count, error: countError } = await supabaseAdmin
      .from('district_selections')
      .select('*', { count: 'exact', head: true })
      .eq('district', district)
      .eq('gender', gender)
      .in('status', ['REGISTERED', 'SELECTED']);

    if (countError) throw countError;

    const currentCount = count || 0;
    const max = capData.max_capacity;
    return NextResponse.json({
      count: currentCount,
      max,
      available: currentCount < max,
    });
  } catch (error) {
    console.error('Check capacity error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
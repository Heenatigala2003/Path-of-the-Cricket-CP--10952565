import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('district_events')
      .select(`
        id,
        gender,
        date,
        status,
        districts!inner (
          id,
          name,
          venue,
          map_link,
          duration,
          ground_type,
          quota,
          coordinates,
          provinces!inner ( name )
        )
      `)
      .order('id');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const districts = data.map((ev: any) => {
      const coords = ev.districts.coordinates || { lat: null, lng: null };
      return {
        id: ev.id,
        name: ev.districts.name,
        province: ev.districts.provinces.name,
        gender: ev.gender,
        date: ev.date,
        venue: ev.districts.venue,
        quota: ev.districts.quota,
        map_link: ev.districts.map_link,
        duration: ev.districts.duration,
        ground_type: ev.districts.ground_type,
        lat: coords.lat,
        lng: coords.lng,
        status: ev.status,
      };
    });

    return NextResponse.json(districts);
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['name', 'province', 'gender', 'date', 'venue', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

   
    const { data: provinceData, error: provinceError } = await supabaseAdmin
      .from('provinces')
      .select('id')
      .eq('name', body.province)
      .single();

    if (provinceError || !provinceData) {
      return NextResponse.json({ error: 'Invalid province name' }, { status: 400 });
    }

    const coordinates = { 
      lat: body.lat !== undefined && body.lat !== null ? body.lat : null, 
      lng: body.lng !== undefined && body.lng !== null ? body.lng : null 
    };

 
    const { data: districtData, error: districtError } = await supabaseAdmin
      .from('districts')
      .insert({
        name: body.name,
        province_id: provinceData.id,
        venue: body.venue,
        map_link: body.map_link || '',
        duration: body.duration || '',
        ground_type: body.ground_type || '',
        quota: body.quota || '',
        coordinates,
      })
      .select('id')
      .single();

    if (districtError) {
      console.error('District insert error:', districtError);
      return NextResponse.json({ error: districtError.message }, { status: 500 });
    }

    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('district_events')
      .insert({
        district_id: districtData.id,
        gender: body.gender,
        date: body.date,
        status: body.status,
      })
      .select('id')
      .single();

    if (eventError) {
      console.error('Event insert error:', eventError);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    return NextResponse.json({ id: eventData.id, district_id: districtData.id }, { status: 201 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
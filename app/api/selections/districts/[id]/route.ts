import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    console.log('PUT called for event id:', id);
    const body = await request.json();
    console.log('Request body:', body);

    
    const { data: existingEvent, error: fetchError } = await supabaseAdmin
      .from('district_events')
      .select('district_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      console.error('Event fetch error:', fetchError);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const districtId = existingEvent.district_id;
    console.log('Associated district_id:', districtId);


    const districtUpdate: any = {};
    const eventUpdate: any = {};


    if (body.name !== undefined) districtUpdate.name = body.name;
    if (body.venue !== undefined) districtUpdate.venue = body.venue;
    if (body.map_link !== undefined) districtUpdate.map_link = body.map_link;
    if (body.duration !== undefined) districtUpdate.duration = body.duration;
    if (body.ground_type !== undefined) districtUpdate.ground_type = body.ground_type;
    if (body.quota !== undefined) districtUpdate.quota = body.quota;

    if (body.province !== undefined) {
      const { data: prov, error: provError } = await supabaseAdmin
        .from('provinces')
        .select('id')
        .ilike('name', body.province.trim())
        .maybeSingle();

      if (provError) {
        console.error('Province lookup error:', provError);
        return NextResponse.json({ error: 'Database error while looking up province' }, { status: 500 });
      }
      if (!prov) {
        return NextResponse.json({ error: `Province "${body.province}" not found` }, { status: 400 });
      }
      districtUpdate.province_id = prov.id;
    }


    if (body.lat !== undefined || body.lng !== undefined) {

      const { data: distData } = await supabaseAdmin
        .from('districts')
        .select('coordinates')
        .eq('id', districtId)
        .maybeSingle();
      const currentCoords = distData?.coordinates || { lat: null, lng: null };
      districtUpdate.coordinates = {
        lat: body.lat !== undefined ? body.lat : currentCoords.lat,
        lng: body.lng !== undefined ? body.lng : currentCoords.lng,
      };
    }


    if (body.date !== undefined) eventUpdate.date = body.date;
    if (body.status !== undefined) eventUpdate.status = body.status;
    if (body.gender !== undefined) eventUpdate.gender = body.gender;

    console.log('District update payload:', districtUpdate);
    console.log('Event update payload:', eventUpdate);

    if (Object.keys(districtUpdate).length > 0) {
      const { error: districtError, count } = await supabaseAdmin
        .from('districts')
        .update(districtUpdate)
        .eq('id', districtId)
        .select('id', { count: 'exact', head: false });

      if (districtError) {
        console.error('District update error:', districtError);
        return NextResponse.json({ error: districtError.message }, { status: 500 });
      }

      if (count === 0) {
        console.error('District not found for id:', districtId);
        return NextResponse.json({ error: `District with id ${districtId} not found` }, { status: 404 });
      }
    }

   
    if (Object.keys(eventUpdate).length > 0) {
      const { error: eventError, count } = await supabaseAdmin
        .from('district_events')
        .update(eventUpdate)
        .eq('id', id)
        .select('id', { count: 'exact', head: false });

      if (eventError) {
        console.error('Event update error:', eventError);
        return NextResponse.json({ error: eventError.message }, { status: 500 });
      }

      if (count === 0) {
        console.error('Event not found for id:', id);
        return NextResponse.json({ error: `Event with id ${id} not found` }, { status: 404 });
      }
    }

    console.log('Update successful');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unhandled error in PUT:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    const { error } = await supabaseAdmin
      .from('district_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unhandled error in DELETE:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
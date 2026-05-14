import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const gender = searchParams.get('gender') || 'boys';
    const province = searchParams.get('province');
    const search = searchParams.get('search') || '';

    
    let query = supabaseAdmin
      .from('district_events')
      .select(`
        id,
        date,
        status,
        gender,
        district:districts!inner (
          id,
          name,
          venue,
          map_link,
          duration,
          ground_type,
          quota,
          coordinates,
          province:provinces!inner (
            name
          )
        )
      `)
      .eq('gender', gender);

    if (province && province !== 'All') {
      query = query.eq('district.province.name', province);
    }

    
    const { data, error } = await query.order('date', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database query failed', details: error.message },
        { status: 500 }
      );
    }


    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

   
    const districts = data.map((item: any) => {
    
      const district = item.district || {};
      const provinceObj = district.province || {};

      return {
        id: item.id,
        name: district.name || 'Unknown District',
        date: item.date,
        venue: district.venue || 'Venue not specified',
        quota: district.quota || 'Not specified',
        province: provinceObj.name || 'Unknown Province',
        mapLink: district.map_link || '#',
        duration: district.duration || 'TBD',
        groundType: district.ground_type || 'Not specified',
        coordinates: district.coordinates || { lat: 0, lng: 0 },
        status: item.status || 'SCHEDULED',
      };
    });

  
    let filtered = districts;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = districts.filter(
        (d) =>
          d.name.toLowerCase().includes(searchLower) ||
          d.venue.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(filtered);
  } catch (err) {
    console.error('Unexpected API error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select(`
        id,
        icon,
        total_points,
        category_tests ( name, description, points_description )
      `)
      .order('id');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const categories = data.map((cat: any) => ({
      id: cat.id,
      title: cat.icon,           
      icon: cat.icon,
      tests: (cat.category_tests || []).map((test: any) => ({
        name: test.name,
        description: test.description,
        points: test.points_description,
      })),
      total: cat.total_points,
    }));

    return NextResponse.json(categories);
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
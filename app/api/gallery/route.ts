import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data, error } = await supabase
    .from('gallery_media')
    .select(`
      *,
      category:categories(id, name, slug, color, icon)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body = await request.json();

    if (!body.title || !body.file_url) {
      return NextResponse.json(
        { error: 'Title and file_url are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('gallery_media')
      .insert([{
        title: body.title,
        description: body.description,
        media_type: body.media_type || 'image',
        file_url: body.file_url,
        thumbnail_url: body.thumbnail_url,
        category_id: body.category_id,
        tags: body.tags,
        width: body.width,
        height: body.height,
        duration: body.duration,
        is_featured: body.is_featured || false,
        is_published: body.is_published !== undefined ? body.is_published : true,
        mime_type: body.mime_type,
        file_size: body.file_size
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
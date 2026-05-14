import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { to, amount, from } = await request.json();

    
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: admin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .single();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

   
    const { error } = await supabase.from('transfers').insert({
      from_address: from,
      to_address: to,
      amount: parseFloat(amount),
      currency: 'USDT',
      status: 'completed',
      metadata: { performed_by: session.user.id }
    });

    if (error) throw error;

    await supabase.rpc('increment_player_total', { p_wallet: to, p_amount: parseFloat(amount) });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
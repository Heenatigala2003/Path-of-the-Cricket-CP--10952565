// app/api/sponsor/applications/route.ts
import { createClient } from '@supabase/supabase-js';
import { sendSponsorshipConfirmation } from '@/lib/email';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

  
    const { company_name, contact_email, sponsorship_tier, proposed_investment } = body;
    if (!company_name || !contact_email || !sponsorship_tier || !proposed_investment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

   
    const { data, error } = await supabase
      .from('sponsorships')
      .insert({
        company_name,
        contact_email,
        contact_phone: body.contact_phone || null,
        website_url: body.website_url || null,
        business_type: body.business_type || null,
        sponsorship_tier,
        proposed_investment: parseFloat(proposed_investment),
        message: body.message || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    sendSponsorshipConfirmation({
      to: contact_email,
      companyName: company_name,
      tier: sponsorship_tier,
      amount: parseFloat(proposed_investment),
    }).catch(console.error);

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating sponsorship:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
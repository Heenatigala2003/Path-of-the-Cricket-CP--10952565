import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';


let applications: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { districtId, playerName, gender, category } = body;

    if (!districtId || !playerName || !gender || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newApp = {
      id: randomUUID(),
      districtId,
      playerName,
      gender,
      category,
      appliedAt: new Date().toISOString(),
    };

    applications.push(newApp);
    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(applications);
}
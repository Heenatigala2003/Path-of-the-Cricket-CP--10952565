import { NextResponse } from 'next/server';


let districts = [
  { id: 1, name: 'Colombo', date: '2025-10-15T09:00:00', venue: 'R. Premadasa International Cricket Stadium', quota: '10 Batters / 10 All-Rounders / 10 Bowlers', province: 'Western', mapLink: 'https://maps.google.com/?q=6.9271,79.8612', duration: 'Full Day (9 AM - 5 PM)', groundType: 'International Stadium', lat: 6.9271, lng: 79.8612, status: 'UPCOMING', gender: 'boys' },

];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const district = districts.find(d => d.id === id);
  if (!district) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(district);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const index = districts.findIndex(d => d.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const body = await request.json();
    districts[index] = { ...districts[index], ...body, id };
    return NextResponse.json(districts[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const index = districts.findIndex(d => d.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const deleted = districts.splice(index, 1)[0];
  return NextResponse.json(deleted);
}
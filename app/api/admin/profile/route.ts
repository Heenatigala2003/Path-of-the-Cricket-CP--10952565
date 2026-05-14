import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
      select: {
        name: true,
        email: true,
        role: true,
        joinDate: true,
        lastLogin: true,
        status: true,
        twoFactorEnabled: true,
        sessionTimeoutMinutes: true,
        loginAlertsEnabled: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Format dates to match frontend expectations
    const formattedAdmin = {
      ...admin,
      joinDate: admin.joinDate.toISOString().split('T')[0],
      lastLogin: admin.lastLogin.toLocaleString(),
    };

    return NextResponse.json(formattedAdmin);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
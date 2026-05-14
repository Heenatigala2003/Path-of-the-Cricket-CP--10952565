import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { twoFactor, sessionTimeout, loginAlerts } = await request.json();

    const updatedAdmin = await prisma.admin.update({
      where: { email: session.user.email! },
      data: {
        twoFactorEnabled: twoFactor,
        sessionTimeoutMinutes: parseInt(sessionTimeout),
        loginAlertsEnabled: loginAlerts,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
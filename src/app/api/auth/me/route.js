import { NextResponse } from 'next/server';
import { getSession, deleteSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = db.getUserById(session.userId);
  const profile = db.getProfileByUserId(session.userId);

  if (!user || !profile) {
    await deleteSession();
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ 
    user: {
      id: user.id,
      email: user.email,
      name: profile.name,
      hasPaid: user.email.toLowerCase() === 'aawoodshop@gmail.com' || !!user.hasPaid
    }
  });
}

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}

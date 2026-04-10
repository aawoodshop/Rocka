import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16'
});

export async function POST(req) {
  try {
    const { sessionId } = await req.json();
    const sessionCookie = await getSession();

    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Mock Mode
    if (sessionId === 'mock_session_success' && (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock')) {
        db.markUserAsPaid(sessionCookie.userId);
        return NextResponse.json({ success: true });
    }

    // Live Mode verification via Stripe Server
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid' && session.client_reference_id === sessionCookie.userId) {
          db.markUserAsPaid(sessionCookie.userId);
          return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: 'Payment not completely verified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

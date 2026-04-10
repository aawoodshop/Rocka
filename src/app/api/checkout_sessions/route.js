import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16'
});

export async function POST(req) {
  try {
    const sessionCookie = await getSession();
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine the host programmatically
    const requestUrl = new URL(req.url);
    const origin = `${requestUrl.protocol}//${requestUrl.host}`;

    // Development / Mock fallback when Stripe keys are missing
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
        // Just return a special mock URL that the frontend will catch and verify
        return NextResponse.json({ url: `${origin}/dashboard?session_id=mock_session_success` });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Stock Dashboard - Yearly Premium Access',
            },
            unit_amount: 17900, // $179.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: sessionCookie.userId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiter for checkout (3 requests per 60 seconds per user)
const checkoutRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  prefix: "ratelimit:checkout:",
});

// Timeout wrapper for Stripe calls (25 second timeout)
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 25000
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();

    // Server-side validation of price ID - critical security check
    const validPriceIds = [
      process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    ].filter(Boolean);

    if (!priceId || !validPriceIds.includes(priceId)) {
      console.log('Invalid price ID:', priceId);
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    // Create server client to get user session
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Checkout - User:', user?.id);
    console.log('Checkout - Auth error:', authError);

    if (authError || !user) {
      console.log('Unauthorized - no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting per user
    const { success } = await checkoutRatelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please try again in 60 seconds.' },
        { status: 429 }
      );
    }

    // Get user email from user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Create or retrieve Stripe customer
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await withTimeout(stripe.customers.create({
        email: profile.email,
        metadata: { userId: user.id },
      }));
      customerId = customer.id;

      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    
    const session = await withTimeout(stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
      },
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      billing_address_collection: 'required',
    }));

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

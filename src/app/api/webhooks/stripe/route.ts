import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSubscriptionConfirmationEmail, sendSubscriptionCanceledEmail, sendSubscriptionUpdatedEmail } from '@/lib/email';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = supabaseAdmin;

  // Idempotency check - prevent duplicate processing
  const eventId = event.id;
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .single();

  if (existingEvent) {
    console.log('Duplicate webhook event received:', eventId);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Mark event as processing
  await supabase
    .from('webhook_events')
    .insert({ event_id: eventId, event_type: event.type });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed event');
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        
        console.log('Session metadata:', session.metadata);
        console.log('UserId from session:', userId);
        console.log('SubscriptionId:', subscriptionId);

        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }

        // Retrieve subscription details
        const subscription = await withTimeout(stripe.subscriptions.retrieve(subscriptionId));
        const priceId = subscription.items.data[0].price.id;
        
        // Handle current_period_end - could be missing or in different format
        const sub = subscription as any;
        let currentPeriodEnd = sub.current_period_end;
        if (!currentPeriodEnd) {
          // Fallback: default to 30 days from now
          currentPeriodEnd = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
        }
        
        console.log('Subscription current_period_end:', currentPeriodEnd);

        // Determine tier from price ID
        const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
        
        console.log('Price from Stripe:', priceId);
        console.log('Pro Price ID:', proPriceId);

        let tier: string = 'free';
        if (priceId === proPriceId) {
          tier = 'pro';
        }

        // Update user profile
        console.log('Updating user profile for userId:', userId, 'to tier:', tier);
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            subscription_id: subscriptionId,
            plan_expires_at: new Date(currentPeriodEnd * 1000).toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Failed to update user profile:', updateError);
        } else {
          console.log('User profile updated successfully!');
        }

        // Send confirmation email
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('email, name')
          .eq('id', userId)
          .single();

        if (profile?.email) {
          await sendSubscriptionConfirmationEmail({
            email: profile.email,
            name: profile.name,
            tier,
          });
        }

        console.log(`User ${userId} upgraded to ${tier}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Try to find user by customer ID
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single();
          
          if (profile) {
            await handleSubscriptionUpdate(supabase, profile.id, subscription);
          }
        } else {
          await handleSubscriptionUpdate(supabase, userId, subscription);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        let profileId = userId;

        if (!userId) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single();
          
          if (profile) {
            profileId = profile.id;
          }
        }

        if (profileId) {
          // Get user email for cancellation email
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('email, name, plan_expires_at')
            .eq('id', profileId)
            .single();

          await supabase
            .from('user_profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
              subscription_id: null,
            })
            .eq('id', profileId);

          // Send cancellation email
          if (profile?.email) {
            await sendSubscriptionCanceledEmail({
              email: profile.email,
              name: profile.name,
              expiresAt: profile.plan_expires_at,
            });
          }
        }
        console.log(`Subscription canceled for user ${userId || subscription.customer}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const invoiceId = invoice.id;
        const attemptCount = invoice.attempt_count;
        const amountDue = invoice.amount_due;
        const currency = invoice.currency;
        // subscription is an expandable field - cast to access
        const subscriptionId = (invoice as any).subscription as string;

        console.log('=== PAYMENT FAILED EVENT ===');
        console.log('Invoice ID:', invoiceId);
        console.log('Customer ID:', customerId);
        console.log('Subscription ID:', subscriptionId);
        console.log('Attempt count:', attemptCount);
        console.log('Amount due:', `${currency} ${amountDue / 100}`);
        console.log('==============================');

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, email, subscription_tier, subscription_status')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          console.log('Found user profile:', {
            userId: profile.id,
            email: profile.email,
            currentTier: profile.subscription_tier,
            currentStatus: profile.subscription_status
          });

          await supabase
            .from('user_profiles')
            .update({ subscription_status: 'past_due' })
            .eq('id', profile.id);
          
          console.log(`⚠️ Payment failed for user ${profile.id} (${profile.email}) - status set to past_due`);
          
          // Log for debugging/failed_payment_log table (optional future enhancement)
          console.log(`[ALERT] User ${profile.id} payment failed. Invoice: ${invoiceId}, Attempts: ${attemptCount}`);
        } else {
          console.error(`❌ Payment failed but no user found for customer: ${customerId}`);
          console.error('This may indicate a orphaned subscription in Stripe');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log(`✅ Webhook processed successfully: ${event.type} (${event.id})`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    console.error('Error details:', {
      eventType: event?.type,
      eventId: event?.id,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionUpdate(
  supabase: typeof supabaseAdmin,
  userId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0].price.id;
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  
  console.log('Price from Stripe (update):', priceId);
  console.log('Pro Price ID (update):', proPriceId);
  const sub = subscription as any;
  let currentPeriodEnd = sub.current_period_end;
  if (!currentPeriodEnd) {
    // Fallback: default to 30 days from now
    currentPeriodEnd = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
  }

  let tier = 'free';
  if (priceId === proPriceId) {
    tier = 'pro';
  }

  // Get user profile for email
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('email, name')
    .eq('id', userId)
    .single();

  await supabase
    .from('user_profiles')
    .update({
      subscription_tier: tier,
      subscription_status: subscription.status,
      plan_expires_at: new Date(currentPeriodEnd * 1000).toISOString(),
    })
    .eq('id', userId);

  // Send update email
  if (profile?.email && subscription.status === 'active') {
    await sendSubscriptionUpdatedEmail({
      email: profile.email,
      name: profile.name,
      status: subscription.status,
    });
  }

  console.log(`User ${userId} subscription updated to ${tier} (${subscription.status})`);
}

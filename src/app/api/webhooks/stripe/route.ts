import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSubscriptionConfirmationEmail, sendSubscriptionCanceledEmail, sendSubscriptionUpdatedEmail } from '@/lib/email';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }

        // Retrieve subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const currentPeriodEnd = (subscription as any).current_period_end;

        // Determine tier from price ID
        const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
        const familyPriceId = process.env.STRIPE_FAMILY_PRICE_ID;

        let tier: string = 'free';
        if (priceId === familyPriceId) {
          tier = 'family';
        } else if (priceId === proPriceId) {
          tier = 'pro';
        }

        // Update user profile
        await supabase
          .from('user_profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            subscription_id: subscriptionId,
            plan_expires_at: new Date(currentPeriodEnd * 1000).toISOString(),
          })
          .eq('id', userId);

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

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase
            .from('user_profiles')
            .update({ subscription_status: 'past_due' })
            .eq('id', profile.id);
          console.log(`Payment failed for user ${profile.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionUpdate(
  supabase: typeof supabaseAdmin,
  userId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0].price.id;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  const familyPriceId = process.env.STRIPE_FAMILY_PRICE_ID;
  const currentPeriodEnd = (subscription as any).current_period_end;

  let tier = 'free';
  if (priceId === familyPriceId) {
    tier = 'family';
  } else if (priceId === proPriceId) {
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

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = 'MealClaw <noreply@mealclaw.com>';

interface SubscriptionEmailParams {
  email: string;
  name?: string;
  tier?: string;
  status?: string;
  expiresAt?: string;
}

export async function sendSubscriptionConfirmationEmail({ email, name, tier }: SubscriptionEmailParams) {
  if (!resend) {
    console.log('Resend not configured, skipping email');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🎉 Welcome to MealClaw Pro!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #eab308;">🎉 Welcome to MealClaw Pro!</h1>
          <p>Hi${name ? ` ${name}` : ''},</p>
          <p>Thank you for upgrading to MealClaw Pro! 🎊</p>
          <div style="background: #fef9c3; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">Your Pro Benefits:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>✓ Unlimited wheel spins</li>
              <li>✓ Unlimited pantry items</li>
              <li>✓ Advanced recipe filters</li>
              <li>✓ Auto shopping lists</li>
              <li>✓ Weekly meal plans</li>
              <li>✓ Nutritional info</li>
            </ul>
          </div>
          <p>You can manage your subscription anytime at: <a href="https://mealclaw.com/subscription">mealclaw.com/subscription</a></p>
          <p>Thanks,<br>The MealClaw Team</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send subscription confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendSubscriptionCanceledEmail({ email, name, expiresAt }: SubscriptionEmailParams) {
  if (!resend) {
    console.log('Resend not configured, skipping email');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const formattedDate = expiresAt 
      ? new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'soon';

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '😢 Your MealClaw Pro Subscription',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #666;">Your subscription has been canceled</h1>
          <p>Hi${name ? ` ${name}` : ''},</p>
          <p>Your MealClaw Pro subscription has been canceled. You'll continue to have access until <strong>${formattedDate}</strong>.</p>
          <p>We're sorry to see you go! If there's anything we can do to improve, please reach out.</p>
          <p>You can resubscribe anytime at: <a href="https://mealclaw.com/upgrade">mealclaw.com/upgrade</a></p>
          <p>Thanks,<br>The MealClaw Team</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    return { success: false, error };
  }
}

export async function sendSubscriptionUpdatedEmail({ email, name, status }: SubscriptionEmailParams) {
  if (!resend) {
    console.log('Resend not configured, skipping email');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '✅ Your MealClaw Subscription Has Been Updated',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">✅ Subscription Updated</h1>
          <p>Hi${name ? ` ${name}` : ''},</p>
          <p>Your MealClaw subscription has been updated. Status: <strong>${status}</strong></p>
          <p>Manage your subscription: <a href="https://mealclaw.com/subscription">mealclaw.com/subscription</a></p>
          <p>Thanks,<br>The MealClaw Team</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send update email:', error);
    return { success: false, error };
  }
}

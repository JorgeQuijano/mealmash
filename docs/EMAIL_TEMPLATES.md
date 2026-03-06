# MealClaw Email Templates

## Overview
Custom email templates for MealClaw using Supabase Auth + Resend SMTP.

---

## Email Templates to Configure in Supabase

### 1. Confirm Signup Email
```
Subject: Welcome to MealClaw! Confirm your email

Hi {{ .User.Email }},

Thanks for signing up for MealClaw! 🎉

Click the button below to confirm your email and get started:

[Confirm Email Button]
https://mealclaw.com/confirm?token={{ .Token }}

If you didn't create this account, you can safely ignore this email.

— The MealClaw Team
```

### 2. Password Reset Email
```
Subject: Reset your MealClaw password

Hi {{ .User.Email }},

We received a request to reset your password. Click the button below to create a new password:

[Reset Password Button]
https://mealclaw.com/reset-password?token={{ .Token }}

This link will expire in 24 hours.

If you didn't request this, you can safely ignore this email.

— The MealClaw Team
```

### 3. Magic Link Email
```
Subject: Your MealClaw login link

Hi {{ .User.Email }},

Click the button below to sign in to MealClaw:

[Sign In Button]
https://mealclaw.com/confirm?token={{ .Token }}

This link will expire in 24 hours.

If you didn't request this, you can safely ignore this email.

— The MealClaw Team
```

---

## How to Configure in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. Or **Settings** → **Auth** → **Email**

### Enable these options:
- [x] Enable email confirmations
- [x] Enable password reset
- [x] Enable magic link login
- [x] Secure JWT (recommended)

### Custom Email Templates:
Click **"Edit email templates"** and paste the templates above.

---

## Variables Available

| Variable | Description |
|----------|-------------|
| `{{ .Token }}` | The confirmation/reset token |
| `{{ .User.Email }}` | User's email address |
| `{{ .User.ID }}` | User's UUID |
| `{{ .SiteURL }}` | Your site URL (from settings) |

---

## Branding Tips

- Use your logo as the email header
- Set primary color to match MealClaw's theme (check `src/config/site.ts`)
- Footer: Include "© 2024 MealClaw. All rights reserved."
- Add unsubscribe link: `https://mealclaw.com/unsubscribe`

---

## Testing

1. Create a test account at `https://mealclaw.com/login`
2. Check your email inbox (and spam folder)
3. Verify the branding looks correct
4. Test password reset flow

---

## Troubleshooting

**Emails not sending?**
- Check Supabase Dashboard → Settings → SMTP is configured
- Verify domain is verified in Resend
- Check Resend dashboard for sent emails

**Emails going to spam?**
- Add SPF and DKIM records (Resend provides these)
- Include an unsubscribe link
- Don't use spam trigger words

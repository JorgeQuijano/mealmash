import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | MealClaw',
  description: 'How MealClaw collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-lg text-muted-foreground">
            Last updated: March 22, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              MealClaw (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Account information:</strong> When you create an account, we collect your email address and any information you choose to provide (such as your name).</li>
              <li><strong>Pantry and recipe data:</strong> We store the ingredients you add to your pantry and the recipes you interact with.</li>
              <li><strong>Usage data:</strong> We collect information about how you use MealClaw, including your meal plans, shopping lists, and preferences.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience with recipe recommendations</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
            <p>
              We use Supabase as our backend service provider. Your data is stored securely and is protected using industry-standard measures. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to maintain session state and remember your preferences. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Payment Information</h2>
            <p>
              All payment processing is handled by Stripe. We do not store your credit card or payment details on our servers. Any payment information is subject to Stripe&apos;s privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your personal information</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at privacy@mealclaw.com or through our support channels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Children&apos;s Privacy</h2>
            <p>
              MealClaw is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:<br />
              <a href="mailto:privacy@mealclaw.com" className="text-primary hover:underline">privacy@mealclaw.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

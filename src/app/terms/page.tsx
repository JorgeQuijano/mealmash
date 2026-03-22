import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | MealClaw',
  description: 'The terms and conditions governing your use of MealClaw services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-lg text-muted-foreground">
            Last updated: March 22, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
            <p>
              By accessing or using MealClaw (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p>
              MealClaw provides a recipe discovery and meal planning service that helps users find recipes based on available ingredients, plan meals, and generate shopping lists. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
            <p>
              To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Subscription and Payments</h2>
            <p>
              Some features require a paid subscription. Subscription fees are billed in advance on a monthly basis. You authorize us to charge your payment method for all fees. All payments are processed by Stripe and are subject to Stripe&apos;s terms.
            </p>
            <p className="mt-4">
              <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated systems to access the service without permission</li>
              <li>Collect or harvest any information from the service without consent</li>
              <li>Resell, redistribute, or exploit any part of the service for commercial purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p>
              The service, including all content, features, and functionality, is owned by MealClaw and is protected by copyright, trademark, and other intellectual property laws. You retain ownership of any content you submit to the service.
            </p>
            <p className="mt-4">
              Recipe content is provided for personal, non-commercial use. We do not claim ownership of recipes but respect the intellectual property of recipe creators.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE MAKE NO WARRANTIES ABOUT THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY CONTENT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEALCLAW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless MealClaw and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses arising from your use of the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms shall be resolved in the courts of the applicable jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p>
              We may update these Terms of Service at any time. We will notify you of material changes by posting the new terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:<br />
              <a href="mailto:legal@mealclaw.com" className="text-primary hover:underline">legal@mealclaw.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

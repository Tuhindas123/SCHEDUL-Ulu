import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Legal() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 bg-background text-foreground font-sans min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/70 rounded-lg transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold mb-2 text-foreground">Terms & Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: September 2026</p>

      {/* ===== PRIVACY POLICY ===== */}
      <section>
        <h2 className="text-2xl font-bold mb-3 text-foreground">Privacy Policy</h2>

        <p className="mb-6 leading-relaxed text-foreground/90">
          Welcome to <strong>Schedul-Ulu</strong>. We treat your personal data with complete transparency. This privacy policy details what data we collect when you sign in via Google OAuth, how it is processed, and how your privacy is protected.
        </p>

        <strong className="block text-xl font-semibold text-foreground mt-8 mb-3">1. Information We Collect</strong>
        <p className="mb-3 leading-relaxed text-foreground/90">When you sign in using Google, Schedul-Ulu requests access to basic user profile information:</p>
        <ul className="list-disc pl-6 space-y-2 mb-6 text-foreground/80">
          <li><strong className="text-foreground">Google Profile Info:</strong> Your display name and avatar image to display inside your active session.</li>
          <li><strong className="text-foreground">Email Address:</strong> Used uniquely to authenticate your account and manage user sessions.</li>
          <li><strong className="text-foreground">App Usage Data:</strong> Schedules, event details, and restaurant preference records saved within your dashboard.</li>
        </ul>

        <strong className="block text-xl font-semibold text-foreground mt-8 mb-3">2. How We Use Your Data</strong>
        <p className="mb-3 leading-relaxed text-foreground/90">We use your information strictly to maintain and deliver core features of Schedul-Ulu:</p>
        <ul className="list-disc pl-6 space-y-2 mb-6 text-foreground/80">
          <li>We <strong className="text-foreground">do not</strong> sell, rent, or trade your personal data to third-party brokers or advertisers.</li>
          <li>We <strong className="text-foreground">do not</strong> use your profile or application data to train external AI models.</li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600 dark:border-blue-500 p-4 rounded-r my-6 text-sm text-blue-900 dark:text-blue-200">
          <strong>Google Limited Use Compliance:</strong> Schedul-Ulu's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-medium"
          >
            Google API Services User Data Policy
          </a>, including the Limited Use requirements.
        </div>

        <strong className="block text-xl font-semibold text-foreground mt-8 mb-3">3. Data Deletion</strong>
        <p className="mb-6 leading-relaxed text-foreground/90">
          You retain full control over your data. If you wish to delete your account and wipe all stored user records, contact us at{' '}
          <a href="mailto:tuhin@schedul-ulu.venom3317.workers.dev" className="text-blue-600 dark:text-blue-400 underline">
            tuhin@schedul-ulu.venom3317.workers.dev
          </a>.
        </p>
      </section>

      <hr className="my-10 border-border" />

      {/* ===== TERMS OF SERVICE ===== */}
      <section>
        <h2 className="text-2xl font-bold mb-3 text-foreground">Terms of Service</h2>

        <p className="mb-6 leading-relaxed text-foreground/90">
          By logging in or using Schedul-Ulu, you agree to comply with and be bound by the following Terms of Service. If you do not agree, please do not use the application.
        </p>

        <strong className="block text-xl font-semibold text-foreground mt-8 mb-3">1. Description of Service</strong>
        <p className="mb-6 leading-relaxed text-foreground/80">
          Schedul-Ulu provides user schedule organization, attendance tracking, and local university food options. We reserve the right to modify, suspend, or update core functionality at any time.
        </p>

        <strong className="block text-xl font-semibold text-foreground mt-8 mb-3">2. User Accounts & Acceptable Use</strong>
        <p className="mb-3 leading-relaxed text-foreground/80">When using Schedul-Ulu, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-6 text-foreground/80">
          <li>Authenticate legitimately using your own valid Google account.</li>
          <li>Not attempt to disrupt, exploit, or reverse-engineer the backend infrastructure or API services.</li>
          <li>Not use automated scripts or bots to access or manipulate data within the app.</li>
        </ul>

        <strong className="block text-xl font-semibold text-foreground mt-8 mb-3">3. Intellectual Property</strong>
        <p className="mb-6 leading-relaxed text-foreground/80">
          All branding, code, design elements, and logos associated with Schedul-Ulu are the property of the developer. Google logos and brand attributes belong to Google LLC.
        </p>

        <strong className="block text-xl font-semibold text-foreground mt-8 mb-3">4. Limitation of Liability ("As-Is" Service)</strong>
        <p className="mb-6 leading-relaxed text-foreground/80">
          Schedul-Ulu is provided on an "as is" and "as available" basis without warranties of any kind. We are not responsible for missed classes, inaccurate schedule entries, lost data, or any consequences resulting from service downtime.
        </p>

        <strong className="block text-xl font-semibold text-foreground mt-8 mb-3">5. Termination</strong>
        <p className="mb-6 leading-relaxed text-foreground/80">
          We reserve the right to revoke or restrict access to any account that violates these terms or engages in malicious API activity without prior notice.
        </p>

        <strong className="block text-xl font-semibold text-foreground mt-8 mb-3">6. Contact Information</strong>
        <p className="mb-6 leading-relaxed text-foreground/80">
          If you have questions regarding these Terms, contact us at{' '}
          <a href="mailto:tuhin@schedul-ulu.venom3317.workers.dev" className="text-blue-600 dark:text-blue-400 underline">
            tuhin@schedul-ulu.venom3317.workers.dev
          </a>.
        </p>
      </section>
    </div>
  );
}
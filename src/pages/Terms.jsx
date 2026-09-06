import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 text-gray-800 font-sans min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold mb-2 text-gray-900">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: September 2026</p>

      <p className="mb-6 leading-relaxed">
        Welcome to <strong>Schedul-Ulu</strong>. By logging in or using our service, you agree to comply with and be bound by the following Terms of Service. If you do not agree, please do not use the application.
      </p>

      <strong className="block text-xl font-semibold text-gray-900 mt-8 mb-3">1. Description of Service</strong>
      <p className="mb-6 leading-relaxed text-gray-700">
        Schedul-Ulu provides user schedule organization, attendance tracking, and local university food options. We reserve the right to modify, suspend, or update core functionality at any time.
      </p>

      <strong className="block text-xl font-semibold text-gray-900 mt-8 mb-3">2. User Accounts & Acceptable Use</strong>
      <p className="mb-3 leading-relaxed text-gray-700">When using Schedul-Ulu, you agree to:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
        <li>Authenticate legitimately using your own valid Google account.</li>
        <li>Not attempt to disrupt, exploit, or reverse-engineer the backend infrastructure or API services.</li>
        <li>Not use automated scripts or bots to access or manipulate data within the app.</li>
      </ul>

      <strong className="block text-xl font-semibold text-gray-900 mt-8 mb-3">3. Intellectual Property</strong>
      <p className="mb-6 leading-relaxed text-gray-700">
        All branding, code, design elements, and logos associated with Schedul-Ulu are the property of the developer. Google logos and brand attributes belong to Google LLC.
      </p>

      <strong className="block text-xl font-semibold text-gray-900 mt-8 mb-3">4. Limitation of Liability ("As-Is" Service)</strong>
      <p className="mb-6 leading-relaxed text-gray-700">
        Schedul-Ulu is provided on an "as is" and "as available" basis without warranties of any kind. We are not responsible for missed classes, inaccurate schedule entries, lost data, or any consequences resulting from service downtime.
      </p>

      <strong className="block text-xl font-semibold text-gray-900 mt-8 mb-3">5. Termination</strong>
      <p className="mb-6 leading-relaxed text-gray-700">
        We reserve the right to revoke or restrict access to any account that violates these terms or engages in malicious API activity without prior notice.
      </p>

      <strong className="block text-xl font-semibold text-gray-900 mt-8 mb-3">6. Contact Information</strong>
      <p className="mb-6 leading-relaxed text-gray-700">
        If you have questions regarding these Terms, contact us at{' '}
        <a href="mailto:tuhin@schedul-ulu.venom3317.workers.dev" className="text-blue-600 underline">
          tuhin@schedul-ulu.venom3317.workers.dev
        </a>.
      </p>
    </div>
  );
}
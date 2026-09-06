import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 text-gray-800 font-sans min-h-screen">
      {/* Back Button Bar */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold mb-2 text-gray-900">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: September 2026</p>

      <p className="mb-6 leading-relaxed">
        Welcome to <strong>Schedul-Ulu</strong>. We treat your personal data with complete transparency. This privacy policy details what data we collect when you sign in via Google OAuth, how it is processed, and how your privacy is protected.
      </p>

      <strong className="block text-xl font-semibold text-gray-900 mt-8 mb-3">1. Information We Collect</strong>
      <p className="mb-3 leading-relaxed">When you sign in using Google, Schedul-Ulu requests access to basic user profile information:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
        <li><strong>Google Profile Info:</strong> Your display name and avatar image to display inside your active session.</li>
        <li><strong>Email Address:</strong> Used uniquely to authenticate your account and manage user sessions.</li>
        <li><strong>App Usage Data:</strong> Schedules, event details, and restaurant preference records saved within your dashboard.</li>
      </ul>

      <strong className="block text-xl font-semibold text-gray-900 mt-8 mb-3">2. How We Use Your Data</strong>
      <p className="mb-3 leading-relaxed">We use your information strictly to maintain and deliver core features of Schedul-Ulu:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
        <li>We <strong>do not</strong> sell, rent, or trade your personal data to third-party brokers or advertisers.</li>
        <li>We <strong>do not</strong> use your profile or application data to train external AI models.</li>
      </ul>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r my-6 text-sm text-blue-900">
        <strong>Google Limited Use Compliance:</strong> Schedul-Ulu's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
        <a 
          href="https://developers.google.com/terms/api-services-user-data-policy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline text-blue-700 hover:text-blue-900 font-medium"
        >
          Google API Services User Data Policy
        </a>, including the Limited Use requirements.
      </div>

      <strong className="block text-xl font-semibold text-gray-900 mt-8 mb-3">3. Data Deletion</strong>
      <p className="mb-6 leading-relaxed">
        You retain full control over your data. If you wish to delete your account and wipe all stored user records, contact us at{' '}
        <a href="mailto:tuhin@schedul-ulu.venom3317.workers.dev" className="text-blue-600 underline">
          tuhin@schedul-ulu.venom3317.workers.dev
        </a>.
      </p>
    </div>
  );
}
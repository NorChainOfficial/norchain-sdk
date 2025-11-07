import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Noor Chain Explorer',
  description: 'Privacy policy for Noor Chain blockchain explorer and services.',
};

export default function PrivacyPolicyPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: January 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            Noor Chain ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our blockchain platform and services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
          <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
            <li>Wallet addresses (public blockchain data)</li>
            <li>Contact information (if you reach out to support)</li>
            <li>Transaction data (public on blockchain)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
          <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
            <li>Usage data (pages visited, time spent)</li>
            <li>Device information (browser type, IP address)</li>
            <li>Cookies and similar technologies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-3">We use collected information to:</p>
          <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Improve user experience</li>
            <li>Communicate with you about updates</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Blockchain Data</h2>
          <p className="text-gray-700 mb-3">
            Please note that blockchain transactions are public and permanent. Once you conduct a transaction on Noor Chain:
          </p>
          <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
            <li>Your wallet address becomes publicly visible</li>
            <li>Transaction history is permanently recorded</li>
            <li>This data cannot be deleted or modified</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
          <p className="text-gray-700 mb-3">We may use third-party services for:</p>
          <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Payment Processing:</strong> MoonPay, Transak (they have their own privacy policies)</li>
            <li><strong>Analytics:</strong> To understand how users interact with our platform</li>
            <li><strong>Infrastructure:</strong> Cloud hosting providers</li>
          </ul>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-gray-800">
              <strong>Important:</strong> When you use fiat on-ramp services (MoonPay/Transak), you are subject to their privacy policies and KYC requirements. We do not collect or store your payment information.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
          <p className="text-gray-700 mb-3">
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
            <li>Encryption of data in transit (SSL/TLS)</li>
            <li>Secure server infrastructure</li>
            <li>Regular security audits</li>
            <li>Access controls and monitoring</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
          <p className="text-gray-700 mb-3">You have the right to:</p>
          <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
            <li>Access your personal information</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (except blockchain data)</li>
            <li>Opt-out of marketing communications</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-700">
            Our services are not intended for users under 18 years of age. We do not knowingly collect information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Users</h2>
          <p className="text-gray-700">
            Your information may be transferred to and processed in countries other than your own. By using our services, you consent to such transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify users of material changes by posting the new policy on this page with an updated "Last Updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700">
            Email: <a href="mailto:privacy@norchain.org" className="text-indigo-600 hover:text-indigo-800 underline">privacy@norchain.org</a><br />
            Website: <a href="https://norchain.org" className="text-indigo-600 hover:text-indigo-800 underline">https://norchain.org</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Compliance</h2>
          <p className="text-gray-700 mb-3">
            We are committed to complying with applicable data protection laws, including:
          </p>
          <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
            <li>General Data Protection Regulation (GDPR) for EU users</li>
            <li>California Consumer Privacy Act (CCPA) for California users</li>
            <li>Other applicable regional privacy laws</li>
          </ul>
        </section>

        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex justify-center gap-6 text-gray-600">
            <a href="/" className="hover:text-indigo-600 transition-colors">
              ← Back to Home
            </a>
            <span>|</span>
            <a href="/terms" className="hover:text-indigo-600 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service - Nor Chain',
  description: 'Terms of service for Nor Chain blockchain platform and services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-24 pb-12 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last Updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using Nor Chain and its services, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-3">Nor Chain provides:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>A blockchain network for decentralized transactions</li>
              <li>Decentralized exchange (DEX) services</li>
              <li>Token purchase services via third-party payment processors</li>
              <li>Cross-chain bridge functionality</li>
              <li>Staking and DeFi services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
            <p className="text-gray-700 mb-3">You must:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>Be at least 18 years old</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be located in a jurisdiction where our services are prohibited</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-700 mb-3">You are responsible for:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>Maintaining the security of your private keys and wallet</li>
              <li>All transactions made from your wallet</li>
              <li>Compliance with tax obligations in your jurisdiction</li>
              <li>Ensuring you are legally permitted to use our services</li>
              <li>Your own due diligence before making any transactions</li>
            </ul>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-gray-800">
                <strong>⚠️ Important:</strong> You are solely responsible for your private keys. If you lose your private keys, we cannot recover them. Always keep your keys secure and never share them with anyone.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Risks and Disclaimers</h2>
            <p className="text-gray-700 mb-3">You acknowledge and accept the following risks:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Volatility:</strong> Cryptocurrency prices are highly volatile</li>
              <li><strong>Loss of Funds:</strong> You may lose some or all of your investment</li>
              <li><strong>Technical Risks:</strong> Bugs, hacks, or network issues may occur</li>
              <li><strong>Regulatory Risks:</strong> Laws may change affecting cryptocurrency</li>
              <li><strong>No FDIC Insurance:</strong> Cryptocurrency is not insured</li>
              <li><strong>Irreversible Transactions:</strong> Blockchain transactions cannot be reversed</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Services</h2>
            <p className="text-gray-700 mb-3">We integrate with third-party payment processors (MoonPay, Transak) for fiat purchases. When using these services:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>You are subject to their terms of service and privacy policies</li>
              <li>They may require KYC/AML verification</li>
              <li>We do not control their services or fees</li>
              <li>We are not responsible for their actions or failures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Fees</h2>
            <p className="text-gray-700 mb-3">We may charge fees for:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>Trading on the DEX (typically 0.3%)</li>
              <li>Bridge transfers between chains</li>
              <li>Network gas fees for transactions</li>
            </ul>
            <p className="text-gray-700">All fees are disclosed before you confirm a transaction.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Activities</h2>
            <p className="text-gray-700 mb-3">You may not:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>Use our services for illegal activities</li>
              <li>Attempt to hack, exploit, or disrupt our systems</li>
              <li>Manipulate markets or engage in fraudulent activity</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Use bots or automated systems without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content, trademarks, and intellectual property on Nor Chain are owned by us or our licensors. You may not use our branding without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 mb-3"><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>We provide services &quot;AS IS&quot; without warranties</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid us in the past 12 months</li>
              <li>We are not liable for losses due to market volatility, hacks, or user error</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700 mb-3">You agree to indemnify and hold harmless Nor Chain from any claims, damages, or expenses arising from:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>Your use of our services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any laws or third-party rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
            <p className="text-gray-700 mb-3">We reserve the right to:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>Suspend or terminate your access at any time</li>
              <li>Modify or discontinue services without notice</li>
              <li>Remove content that violates these Terms</li>
            </ul>
            <p className="text-gray-700">You may stop using our services at any time.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We may modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Smart Contract Risks</h2>
            <p className="text-gray-700 mb-3">Our smart contracts have been designed with security in mind, but:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>They may contain bugs or vulnerabilities</li>
              <li>They are immutable once deployed</li>
              <li>We are not liable for smart contract failures</li>
              <li>Always review transaction details before confirming</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. No Investment Advice</h2>
            <p className="text-gray-700 mb-3">Nothing on our platform constitutes:</p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-2">
              <li>Investment advice</li>
              <li>Financial advice</li>
              <li>Legal advice</li>
              <li>Tax advice</li>
            </ul>
            <p className="text-gray-700 mb-4">Always consult with qualified professionals before making investment decisions.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Severability</h2>
            <p className="text-gray-700 mb-4">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Contact Information</h2>
            <p className="text-gray-700 mb-4">For questions about these Terms, contact us at:</p>
            <p className="text-gray-700">
              Email: <a href="mailto:legal@norchain.org" className="text-indigo-600 hover:text-indigo-800 underline">legal@norchain.org</a><br />
              Website: <a href="https://norchain.org" className="text-indigo-600 hover:text-indigo-800 underline">https://norchain.org</a>
            </p>
          </section>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <p className="text-gray-800">
              <strong>📌 IMPORTANT NOTICE:</strong> Cryptocurrency trading involves substantial risk. Only invest what you can afford to lose. Past performance does not guarantee future results. Always do your own research.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="flex justify-center gap-6 text-gray-600">
              <a href="/" className="hover:text-indigo-600 transition-colors">
                ← Back to Home
              </a>
              <span>|</span>
              <a href="/privacy" className="hover:text-indigo-600 transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

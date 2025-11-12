import type { Metadata } from 'next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BridgeWidget from '../../components/bridge/BridgeWidget';

export const metadata: Metadata = {
  title: 'Bridge to Nor Chain - Cross-Chain Asset Transfer',
  description: 'Bridge BNB, USDT, and ETH from BSC to Nor Chain in 30 seconds. Low fees, fast transfers.',
};

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bridge Assets to Nor
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Transfer BNB, USDT, and ETH from BSC to Nor Chain in just 30 seconds
          </p>
        </div>
        <BridgeWidget />
      </div>
      <Footer />
    </div>
  );
}

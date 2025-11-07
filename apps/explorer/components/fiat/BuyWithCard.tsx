'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface BuyWithCardProps {
  readonly defaultCrypto?: string;
  readonly compact?: boolean;
}

type Provider = 'transak' | 'moonpay';
type TransakStatus = 'idle' | 'loading' | 'processing' | 'success' | 'failed';

interface ProviderInfo {
  readonly name: string;
  readonly logo: string;
  readonly fee: string;
  readonly speed: string;
  readonly countries: string;
  readonly recommended?: boolean;
}

const PROVIDERS: Record<Provider, ProviderInfo> = {
  transak: {
    name: 'Transak',
    logo: '⚡',
    fee: '2.99% - 5.5%',
    speed: '2-10 min',
    countries: '160+',
    recommended: true,
  },
  moonpay: {
    name: 'MoonPay',
    logo: '🌙',
    fee: '3.5% - 4.5%',
    speed: '5-15 min',
    countries: '160+',
  },
};

export const BuyWithCard = ({
  defaultCrypto = 'NOR',
  compact = false
}: BuyWithCardProps): JSX.Element => {
  const [selectedProvider, setSelectedProvider] = useState<Provider>('transak');
  const [status, setStatus] = useState<TransakStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [transakInstance, setTransakInstance] = useState<any>(null);

  // Auto-detect wallet on mount
  useEffect(() => {
    const detectWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          if (accounts && accounts[0]) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.log('Wallet not connected:', error);
        }
      }
    };
    detectWallet();
  }, []);

  const openTransak = useCallback(async () => {
    const { Transak: transakSDK } = await import('@transak/transak-sdk');

    setStatus('loading');
    setStatusMessage('Loading Transak gateway...');

    const transakConfig = {
      apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || 'YOUR_API_KEY_HERE',
      environment: (process.env.NEXT_PUBLIC_TRANSAK_ENV || 'STAGING') as 'STAGING' | 'PRODUCTION',
      defaultCryptoCurrency: defaultCrypto,
      walletAddress: walletAddress || undefined,
      themeColor: '4F46E5',
      fiatCurrency: 'USD',
      cryptoCurrencyList: 'NOR,ETH,USDT,BNB',
      fiatCurrencyList: 'USD,EUR,GBP,AUD,CAD',
      networks: 'xaheen,ethereum,bsc',
      hideMenu: false,
      isFeeCalculationHidden: false,
      widgetHeight: '700px',
      widgetWidth: '500px',
    };

    const transak = new transakSDK(transakConfig);

    transak.on(transak.ALL_EVENTS, (data: any) => {
      console.log('Transak event:', data);
    });

    transak.on(transak.EVENTS.TRANSAK_WIDGET_INITIALISED, () => {
      setStatus('processing');
      setStatusMessage('Payment gateway ready');
    });

    transak.on(transak.EVENTS.TRANSAK_ORDER_CREATED, (orderData: any) => {
      setStatus('processing');
      setStatusMessage(`Order created: ${orderData.status?.id || 'Processing...'}`);
    });

    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
      setStatus('success');
      setStatusMessage(`Success! ${defaultCrypto} will arrive in your wallet soon.`);
      setTimeout(() => transak.close(), 3000);
    });

    transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, (error: any) => {
      setStatus('failed');
      setStatusMessage(error?.data?.message || 'Payment failed. Please try again.');
    });

    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      setStatus('idle');
      setStatusMessage('');
    });

    setTransakInstance(transak);
    transak.init();
  }, [defaultCrypto, walletAddress]);

  const openMoonPay = useCallback(() => {
    setStatus('loading');
    setStatusMessage('Opening MoonPay...');

    const moonpayConfig = {
      apiKey: process.env.NEXT_PUBLIC_MOONPAY_API_KEY || 'pk_test_demo',
      currencyCode: defaultCrypto.toLowerCase(),
      walletAddress: walletAddress,
      colorCode: '%234F46E5',
      baseCurrencyAmount: '100',
      baseCurrencyCode: 'USD',
      redirectURL: window.location.href,
    };

    const params = new URLSearchParams(
      Object.entries(moonpayConfig).reduce((acc, [key, value]) => {
        if (value) acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    );

    const moonpayUrl = `https://buy${
      process.env.NEXT_PUBLIC_MOONPAY_ENV === 'sandbox' ? '-sandbox' : ''
    }.moonpay.com/?${params.toString()}`;

    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      moonpayUrl,
      'MoonPay',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    setStatus('processing');
    setStatusMessage('MoonPay window opened');

    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        setStatus('idle');
        setStatusMessage('');
      }
    }, 1000);
  }, [defaultCrypto, walletAddress]);

  const openProvider = useCallback(() => {
    if (!walletAddress) {
      setStatus('failed');
      setStatusMessage('Please connect your wallet first');
      return;
    }

    if (selectedProvider === 'transak') {
      openTransak();
    } else {
      openMoonPay();
    }
  }, [selectedProvider, walletAddress, openTransak, openMoonPay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transakInstance) {
        transakInstance.close();
      }
    };
  }, [transakInstance]);

  const StatusNotification = () => {
    if (!statusMessage) return null;

    const getStatusColor = () => {
      switch (status) {
        case 'success':
          return 'bg-green-500/20 border-green-500 text-green-400';
        case 'failed':
          return 'bg-red-500/20 border-red-500 text-red-400';
        case 'processing':
          return 'bg-blue-500/20 border-blue-500 text-blue-400';
        default:
          return 'bg-gray-500/20 border-gray-500 text-gray-400';
      }
    };

    return (
      <div className={`mt-4 p-4 border rounded-lg ${getStatusColor()} animate-fade-in`}>
        <div className="flex items-center gap-2">
          {status === 'loading' || status === 'processing' ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : status === 'success' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : status === 'failed' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : null}
          <span className="font-medium">{statusMessage}</span>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div>
        <button
          onClick={openProvider}
          disabled={status === 'loading' || status === 'processing'}
          className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {status === 'loading' || status === 'processing' ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Buy with Card
            </>
          )}
        </button>
        <StatusNotification />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-600/10 via-emerald-600/10 to-teal-600/10 rounded-2xl border border-green-500/30 p-8 hover:border-green-500/50 transition-all">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2">Buy {defaultCrypto} with Credit/Debit Card</h3>
          <p className="text-gray-300 mb-6">
            Choose your preferred payment provider. Both are secure, regulated, and available globally.
          </p>

          {/* Provider Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {(Object.entries(PROVIDERS) as [Provider, ProviderInfo][]).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => setSelectedProvider(key)}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  selectedProvider === key
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                }`}
              >
                {provider.recommended && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    RECOMMENDED
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{provider.logo}</span>
                    <span className="text-lg font-bold text-white">{provider.name}</span>
                  </div>
                  {selectedProvider === key && (
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Fee:</span>
                    <span className="font-semibold">{provider.fee}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Speed:</span>
                    <span className="font-semibold">{provider.speed}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Countries:</span>
                    <span className="font-semibold">{provider.countries}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">Instant Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">Secure & Compliant</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">Global Coverage</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openProvider}
              disabled={status === 'loading' || status === 'processing'}
              className="h-14 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {status === 'loading' || status === 'processing' ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <span className="text-2xl">{PROVIDERS[selectedProvider].logo}</span>
                  Buy with {PROVIDERS[selectedProvider].name}
                </>
              )}
            </button>

            <a
              href="/buy"
              className="h-14 px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all border border-slate-600 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              More Options
            </a>
          </div>

          <StatusNotification />

          {/* Provider Info */}
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span>Powered by {PROVIDERS[selectedProvider].name}</span>
            <span>•</span>
            <span>Fees {PROVIDERS[selectedProvider].fee}</span>
            <span>•</span>
            <span>KYC required</span>
            {!walletAddress && (
              <>
                <span>•</span>
                <span className="text-yellow-500 font-semibold">⚠️ Connect wallet first</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

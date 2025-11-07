'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
        <p className="text-white/60 mb-6">{error.message || 'An unexpected error occurred'}</p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}


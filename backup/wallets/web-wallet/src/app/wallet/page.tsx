'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { WalletHomeScreen } from '@/components/WalletHomeScreen';

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletHomeScreen />
    </ProtectedRoute>
  );
}


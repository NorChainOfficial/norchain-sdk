'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CreateWalletScreen } from '@/components/CreateWalletScreen';

export default function CreateWalletPage() {
  return (
    <ProtectedRoute>
      <CreateWalletScreen />
    </ProtectedRoute>
  );
}


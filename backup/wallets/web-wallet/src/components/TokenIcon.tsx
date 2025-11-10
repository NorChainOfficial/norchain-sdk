/**
 * TokenIcon component - matches iOS TokenIcon design
 * Hierarchical logo lookup with fallback monogram
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface TokenIconProps {
  symbol: string;
  size?: number;
  contractAddress?: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({
  symbol,
  size = 40,
  contractAddress,
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // TODO: Implement TokenLogoService equivalent for Web
    // For now, use placeholder
    setLogoUrl(null);
  }, [symbol, contractAddress]);

  const monogram = symbol.charAt(0).toUpperCase();

  if (logoUrl && !error) {
    return (
      <div
        className="rounded-full overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          src={logoUrl}
          alt={symbol}
          width={size}
          height={size}
          className="rounded-full"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // Monogram fallback
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: '#8B5CF6',
        fontSize: size * 0.4,
      }}
    >
      {monogram}
    </div>
  );
};


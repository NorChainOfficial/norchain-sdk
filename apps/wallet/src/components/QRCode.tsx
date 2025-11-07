/**
 * QR Code Component
 * For displaying wallet addresses as QR codes
 * Uses qrcode.react library
 */

'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>
    </div>
  );
};


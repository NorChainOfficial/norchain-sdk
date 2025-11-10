/**
 * QR Code Display Component
 * Uses qrcode.react for rendering QR codes
 */

'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  level = 'M',
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          includeMargin={false}
        />
      </div>
    </div>
  );
};


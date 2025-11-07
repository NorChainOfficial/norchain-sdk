'use client';

import { useState } from 'react';

interface CopyButtonProps {
  readonly value: string;
  readonly className?: string;
  readonly showValue?: boolean;
  readonly truncate?: boolean;
}

export const CopyButton = ({
  value,
  className = '',
  showValue = false,
  truncate = true,
}: CopyButtonProps): JSX.Element => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateValue = (val: string) => {
    if (!truncate || val.length <= 16) return val;
    return `${val.slice(0, 8)}...${val.slice(-8)}`;
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showValue && (
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
          {truncateValue(value)}
        </span>
      )}

      <button
        onClick={handleCopy}
        className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        aria-label="Copy to clipboard"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg
            className="w-4 h-4 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}

        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
};

// Format XAHEEN amount with 26 decimals
export function formatXAHEEN(amount: string | number, decimals: number = 6): string {
  const amountStr = amount.toString();

  // Handle decimal strings from API (already formatted with decimals)
  if (amountStr.includes('.')) {
    const [wholePart, fractionalPart = ''] = amountStr.split('.');
    const formattedFractional = fractionalPart.slice(0, decimals).padEnd(decimals, '0');
    return `${wholePart}.${formattedFractional} XAHEEN`;
  }

  // Handle integer strings (base units) - convert from base units to XAHEEN (divide by 10^26)
  const amountBigInt = BigInt(amountStr);
  const divisor = BigInt('100000000000000000000000000'); // 10^26

  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;

  // Format fractional part with specified decimals
  const fractionalStr = fractionalPart.toString().padStart(26, '0').slice(0, decimals);

  return `${wholePart}.${fractionalStr} XAHEEN`;
}

// Truncate hash for display
export function truncateHash(hash: string, start: number = 8, end: number = 8): string {
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

// Format date
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

// Format time ago (e.g., "2 minutes ago", "3 hours ago")
export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

// Format address for display (truncate with ellipsis)
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Detect if an address is likely a smart contract
 * For now, this is a simple heuristic - in production, this should query the blockchain
 * to check if the address has bytecode.
 *
 * Common patterns for contract addresses:
 * - Cosmos SDK: Addresses with module accounts or specific prefixes
 * - Pattern matching can be enhanced based on your chain's contract deployment patterns
 */
export function isContractAddress(address: string, accountType?: string): boolean {
  if (!address) return false;

  // Check if account type explicitly indicates it's a contract
  if (accountType && (
    accountType.toLowerCase().includes('contract') ||
    accountType.toLowerCase().includes('module') ||
    accountType === 'smart_contract'
  )) {
    return true;
  }

  // Additional heuristics can be added here
  // For example, checking address patterns, prefixes, or length

  return false;
}

/**
 * Get account type label for display
 */
export function getAccountTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'user': 'Wallet',
    'contract': 'Contract',
    'smart_contract': 'Smart Contract',
    'module': 'Module Account',
    'validator': 'Validator',
  };

  return typeMap[type.toLowerCase()] || type;
}

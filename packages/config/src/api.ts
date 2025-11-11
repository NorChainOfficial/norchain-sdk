/**
 * API configuration and endpoints
 */

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  // Account endpoints
  ACCOUNT: {
    BALANCE: '/account/balance',
    TRANSACTIONS: '/account/txlist',
    TOKEN_LIST: '/account/tokenlist',
    TOKEN_TRANSFERS: '/account/tokentx',
    BALANCE_MULTI: '/account/balancemulti',
    INTERNAL_TX: '/account/txlistinternal',
    SUMMARY: '/account/summary',
  },

  // Transaction endpoints
  TRANSACTION: {
    RECEIPT_STATUS: '/transaction/gettxreceiptstatus',
    STATUS: '/transaction/getstatus',
    INFO: '/transaction/gettxinfo',
    BROADCAST: '/transaction/broadcast',
  },

  // Block endpoints
  BLOCK: {
    BY_NUMBER: '/block/getblocknumber',
    LATEST: '/block/latest',
    BY_HASH: '/block/getblock',
    REWARD: '/block/getblockreward',
  },

  // Token endpoints
  TOKEN: {
    INFO: '/token/info',
    HOLDERS: '/token/holders',
    TRANSFERS: '/token/transfers',
    SUPPLY: '/token/supply',
  },

  // Payment endpoints
  PAYMENT: {
    CREATE: '/payments/create',
    GET: '/payments/:id',
    LIST: '/payments/list',
    INVOICE: '/payments/invoice',
    SUBSCRIPTION: '/payments/subscription',
    REFUND: '/payments/refund',
    CHECKOUT: '/payments/checkout',
  },

  // Governance endpoints
  GOVERNANCE: {
    PROPOSALS: '/governance/proposals',
    PROPOSAL: '/governance/proposal/:id',
    VOTE: '/governance/vote',
    PARAMS: '/governance/params',
  },

  // Validator endpoints
  VALIDATOR: {
    LIST: '/validator/list',
    INFO: '/validator/:address',
    DELEGATIONS: '/validator/:address/delegations',
    REWARDS: '/validator/:address/rewards',
  },

  // Compliance endpoints
  COMPLIANCE: {
    KYC: '/compliance/kyc',
    POLICY_CHECK: '/compliance/policy-check',
    AML_SCREEN: '/compliance/aml-screen',
    SHARIA_CHECK: '/compliance/sharia-check',
  },

  // Analytics endpoints
  ANALYTICS: {
    STATS: '/analytics/stats',
    CHARTS: '/analytics/charts',
    PRICE: '/analytics/price',
  },

  // Health and monitoring
  HEALTH: '/health',
  VERSION: '/version',
} as const;

/**
 * API request configuration defaults
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

/**
 * Build full endpoint URL
 */
export const buildEndpoint = (baseUrl: string, path: string, params?: Record<string, string>): string => {
  let url = `${baseUrl}${path}`;

  if (params) {
    Object.keys(params).forEach((key) => {
      url = url.replace(`:${key}`, params[key]);
    });
  }

  return url;
};

/**
 * WebSocket channels
 */
export const WS_CHANNELS = {
  BLOCKS: 'blocks',
  TRANSACTIONS: 'transactions',
  PRICE: 'price',
  BALANCE: 'balance',
  VALIDATORS: 'validators',
} as const;

/**
 * API error codes
 */
export const API_ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];

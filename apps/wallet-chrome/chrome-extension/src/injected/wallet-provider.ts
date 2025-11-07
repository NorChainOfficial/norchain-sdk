/**
 * Wallet Provider Injection Script
 * Implements EIP-1193 provider for dApp connection
 */

interface EthereumProvider {
  isMetaMask?: boolean;
  isNoorWallet?: boolean;
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
}

class NoorWalletProvider implements EthereumProvider {
  isNoorWallet = true;
  private listeners: Map<string, Set<Function>> = new Map();

  async request(args: { method: string; params?: any[] }): Promise<any> {
    const { method, params } = args;

    // Send message to extension
    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString();
      
      window.postMessage({
        type: 'NOOR_WALLET_REQUEST',
        id: messageId,
        method,
        params,
      }, '*');

      // Listen for response
      const handler = (event: MessageEvent) => {
        if (
          event.data.type === 'NOOR_WALLET_RESPONSE' &&
          event.data.id === messageId
        ) {
          window.removeEventListener('message', handler);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      window.addEventListener('message', handler);
    });
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  removeListener(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  // EIP-1193 Methods
  async eth_requestAccounts(): Promise<string[]> {
    return this.request({ method: 'eth_requestAccounts' });
  }

  async eth_accounts(): Promise<string[]> {
    return this.request({ method: 'eth_accounts' });
  }

  async eth_sendTransaction(transaction: any): Promise<string> {
    return this.request({ 
      method: 'eth_sendTransaction', 
      params: [transaction] 
    });
  }

  async eth_signTransaction(transaction: any): Promise<string> {
    return this.request({ 
      method: 'eth_signTransaction', 
      params: [transaction] 
    });
  }

  async personal_sign(message: string, address: string): Promise<string> {
    return this.request({ 
      method: 'personal_sign', 
      params: [message, address] 
    });
  }
}

// Inject provider into window.ethereum
if (typeof window !== 'undefined') {
  const provider = new NoorWalletProvider();
  
  // Make provider available as window.ethereum
  Object.defineProperty(window, 'ethereum', {
    value: provider,
    writable: false,
    configurable: false,
  });

  // Also provide as window.noorWallet
  Object.defineProperty(window, 'noorWallet', {
    value: provider,
    writable: false,
    configurable: false,
  });
}


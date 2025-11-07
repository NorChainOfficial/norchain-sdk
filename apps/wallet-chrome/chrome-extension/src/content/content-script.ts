/**
 * Content Script for Chrome Extension
 * Injects wallet provider for dApp connection (EIP-1193)
 */

// Inject wallet provider into page
(function() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('dist/injected/wallet-provider.js');
  script.onload = function() {
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();

// Listen for messages from injected script
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return;
  
  if (event.data.type && event.data.type.startsWith('NOOR_WALLET_')) {
    // Forward to background script
    chrome.runtime.sendMessage(event.data, (response) => {
      // Send response back to page
      window.postMessage({
        type: event.data.type + '_RESPONSE',
        data: response,
        id: event.data.id,
      }, '*');
    });
  }
});

// Forward messages from background to page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type && message.type.startsWith('NOOR_WALLET_')) {
    window.postMessage(message, '*');
  }
  return true;
});


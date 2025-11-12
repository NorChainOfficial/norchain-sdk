/**
 * Service Worker for Chrome Extension
 * Handles background tasks and Supabase sync
 */

import { SupabaseService } from '../services/supabase-service';

const supabaseService = SupabaseService.getInstance();

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Nor Wallet Extension installed');
  
  // Check Supabase connection
  supabaseService.checkSession().catch(err => {
    console.error('Failed to check session:', err);
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_AUTH') {
    supabaseService.checkSession().then(() => {
      sendResponse({ authenticated: supabaseService.authenticated });
    });
    return true; // Async response
  }
  
  if (message.type === 'SIGN_IN') {
    supabaseService.signIn(message.email, message.password)
      .then(session => {
        sendResponse({ success: true, session });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  
  return false;
});

// Periodic sync (every 5 minutes)
setInterval(() => {
  if (supabaseService.authenticated) {
    // Sync wallet data
    // TODO: Implement sync logic
  }
}, 5 * 60 * 1000);


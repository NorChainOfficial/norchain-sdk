/**
 * Popup script for Chrome Extension
 * Handles UI interactions and Supabase service
 */

import { SupabaseService } from '../services/supabase-service';

const supabaseService = SupabaseService.getInstance();

// DOM Elements
const statusCard = document.getElementById('statusCard')!;
const statusIndicator = document.getElementById('statusIndicator')!;
const statusText = document.getElementById('statusText')!;
const authSection = document.getElementById('authSection')!;
const walletSection = document.getElementById('walletSection')!;
const emailInput = document.getElementById('emailInput') as HTMLInputElement;
const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
const signInBtn = document.getElementById('signInBtn')!;
const signUpBtn = document.getElementById('signUpBtn')!;
const signOutBtn = document.getElementById('signOutBtn')!;
const loading = document.getElementById('loading')!;

// Initialize
async function init() {
  await supabaseService.checkSession();
  updateUI();
  
  // Listen for auth changes
  supabaseService.onSessionChange((session) => {
    updateUI();
  });
}

function updateUI() {
  const authenticated = supabaseService.authenticated;
  
  if (authenticated) {
    statusIndicator.classList.add('connected');
    statusText.textContent = 'Connected & Authenticated';
    authSection.style.display = 'none';
    walletSection.style.display = 'flex';
  } else {
    statusIndicator.classList.remove('connected');
    statusText.textContent = 'Not Authenticated';
    authSection.style.display = 'flex';
    walletSection.style.display = 'none';
  }
}

// Event Listeners
signInBtn.addEventListener('click', async () => {
  loading.style.display = 'flex';
  try {
    await supabaseService.signIn(emailInput.value, passwordInput.value);
    updateUI();
  } catch (error: any) {
    alert('Sign in failed: ' + error.message);
  } finally {
    loading.style.display = 'none';
  }
});

signUpBtn.addEventListener('click', async () => {
  loading.style.display = 'flex';
  try {
    await supabaseService.signUp(emailInput.value, passwordInput.value);
    updateUI();
  } catch (error: any) {
    alert('Sign up failed: ' + error.message);
  } finally {
    loading.style.display = 'none';
  }
});

signOutBtn.addEventListener('click', async () => {
  await supabaseService.signOut();
  updateUI();
});

// Initialize on load
init();


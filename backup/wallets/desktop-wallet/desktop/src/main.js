/**
 * Desktop Wallet Main Entry Point
 * Uses Tauri for native desktop app
 */

import { invoke } from '@tauri-apps/api/tauri';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://acyilidfiyfeouzzfkzo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeWlsaWRmaXlmZW91enpma3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzg1NTgsImV4cCI6MjA3NzkxNDU1OH0.9-DG3V_IDdIO7aBXitvz58Zzu3KDQY3T3B8US78lqkg';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('app');
  
  // Check Supabase connection
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      app.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h1>Noor Wallet</h1>
          <p>Welcome! User ID: ${session.user.id}</p>
          <button id="signOutBtn" style="margin-top: 20px; padding: 10px 20px; background: #8B5CF6; border: none; border-radius: 8px; color: white; cursor: pointer;">
            Sign Out
          </button>
        </div>
      `;
      
      document.getElementById('signOutBtn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        location.reload();
      });
    } else {
      app.innerHTML = `
        <div style="padding: 40px; max-width: 400px; margin: 0 auto;">
          <h1 style="text-align: center; margin-bottom: 40px;">Noor Wallet</h1>
          <input type="email" id="email" placeholder="Email" style="width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; background: rgba(255,255,255,0.1); color: white;">
          <input type="password" id="password" placeholder="Password" style="width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; background: rgba(255,255,255,0.1); color: white;">
          <button id="signInBtn" style="width: 100%; padding: 12px; background: #8B5CF6; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">
            Sign In
          </button>
          <button id="signUpBtn" style="width: 100%; padding: 12px; margin-top: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; color: white; cursor: pointer;">
            Sign Up
          </button>
        </div>
      `;
      
      document.getElementById('signInBtn').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          alert('Sign in failed: ' + error.message);
        } else {
          location.reload();
        }
      });
      
      document.getElementById('signUpBtn').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          alert('Sign up failed: ' + error.message);
        } else {
          alert('Sign up successful! Please check your email.');
        }
      });
    }
  } catch (error) {
    app.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h1>Error</h1>
        <p>${error.message}</p>
      </div>
    `;
  }
});

// Listen for Rust commands
window.addEventListener('message', async (event) => {
  if (event.data.type === 'TAURI_COMMAND') {
    try {
      const result = await invoke(event.data.command, event.data.args || {});
      window.postMessage({
        type: 'TAURI_RESPONSE',
        id: event.data.id,
        result,
      }, '*');
    } catch (error) {
      window.postMessage({
        type: 'TAURI_RESPONSE',
        id: event.data.id,
        error: error.message,
      }, '*');
    }
  }
});


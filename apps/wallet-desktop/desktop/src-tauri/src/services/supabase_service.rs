/// Supabase service for Desktop (Rust)
/// Mirrors iOS SupabaseService.swift functionality

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::services::supabase_config::SupabaseConfig;

// TODO: Replace with actual Supabase Rust SDK
// For now, using HTTP client approach
use reqwest::Client;

pub struct SupabaseService {
    client: Arc<Client>,
    url: String,
    key: String,
    current_session: Arc<RwLock<Option<Session>>>,
}

impl SupabaseService {
    pub fn new() -> Self {
        Self {
            client: Arc::new(Client::new()),
            url: SupabaseConfig::supabase_url().to_string(),
            key: SupabaseConfig::supabase_key().to_string(),
            current_session: Arc::new(RwLock::new(None)),
        }
    }

    pub async fn check_session(&self) -> Result<(), Box<dyn std::error::Error>> {
        // TODO: Implement session check using Supabase Auth API
        // For now, placeholder
        Ok(())
    }

    pub async fn sign_up(
        &self,
        email: &str,
        password: &str,
    ) -> Result<Session, Box<dyn std::error::Error>> {
        let url = format!("{}/auth/v1/signup", self.url);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.key)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "email": email,
                "password": password
            }))
            .send()
            .await?;
        
        if response.status().is_success() {
            let auth_response: AuthResponse = response.json().await?;
            if let Some(session) = auth_response.session {
                let session = Session {
                    user_id: session.user.id,
                    access_token: session.access_token,
                    refresh_token: session.refresh_token.unwrap_or_default(),
                };
                *self.current_session.write().await = Some(session.clone());
                return Ok(session);
            }
        }
        
        Err("Sign up failed".into())
    }

    pub async fn sign_in(
        &self,
        email: &str,
        password: &str,
    ) -> Result<Session, Box<dyn std::error::Error>> {
        let url = format!("{}/auth/v1/token?grant_type=password", self.url);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.key)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "email": email,
                "password": password
            }))
            .send()
            .await?;
        
        if response.status().is_success() {
            let auth_response: AuthResponse = response.json().await?;
            if let Some(session) = auth_response.session {
                let session = Session {
                    user_id: session.user.id,
                    access_token: session.access_token,
                    refresh_token: session.refresh_token.unwrap_or_default(),
                };
                *self.current_session.write().await = Some(session.clone());
                return Ok(session);
            }
        }
        
        Err("Sign in failed".into())
    }

    pub async fn sign_out(&self) -> Result<(), Box<dyn std::error::Error>> {
        // TODO: Implement sign out
        *self.current_session.write().await = None;
        Ok(())
    }

    pub async fn register_device(
        &self,
        platform: &str,
        label: &str,
        push_token: Option<&str>,
    ) -> Result<Device, Box<dyn std::error::Error>> {
        let session = self.current_session.read().await.clone();
        let session = session.ok_or("Not authenticated")?;
        
        let url = format!("{}/rest/v1/devices", self.url);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.key)
            .header("Authorization", format!("Bearer {}", session.access_token))
            .header("Content-Type", "application/json")
            .header("Prefer", "return=representation")
            .json(&serde_json::json!({
                "user_id": session.user_id,
                "platform": platform,
                "device_label": label,
                "push_token": push_token,
                "is_active": true
            }))
            .send()
            .await?;
        
        if response.status().is_success() {
            let device: Device = response.json().await?;
            return Ok(device);
        }
        
        Err("Device registration failed".into())
    }

    pub async fn create_account(
        &self,
        chain: &str,
        address: &str,
        account_type: &str,
        is_default: bool,
    ) -> Result<SupabaseAccount, Box<dyn std::error::Error>> {
        let session = self.current_session.read().await.clone();
        let session = session.ok_or("Not authenticated")?;
        
        let url = format!("{}/rest/v1/accounts", self.url);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.key)
            .header("Authorization", format!("Bearer {}", session.access_token))
            .header("Content-Type", "application/json")
            .header("Prefer", "return=representation")
            .json(&serde_json::json!({
                "user_id": session.user_id,
                "chain": chain,
                "address": address,
                "type": account_type,
                "is_default": is_default
            }))
            .send()
            .await?;
        
        if response.status().is_success() {
            let account: SupabaseAccount = response.json().await?;
            return Ok(account);
        }
        
        Err("Account creation failed".into())
    }

    pub async fn fetch_accounts(&self) -> Result<Vec<SupabaseAccount>, Box<dyn std::error::Error>> {
        let session = self.current_session.read().await.clone();
        let session = session.ok_or("Not authenticated")?;
        
        let url = format!("{}/rest/v1/accounts?user_id=eq.{}", self.url, session.user_id);
        
        let response = self.client
            .get(&url)
            .header("apikey", &self.key)
            .header("Authorization", format!("Bearer {}", session.access_token))
            .send()
            .await?;
        
        if response.status().is_success() {
            let accounts: Vec<SupabaseAccount> = response.json().await?;
            return Ok(accounts);
        }
        
        Ok(vec![])
    }

    pub fn get_session(&self) -> Option<Session> {
        // TODO: Make async or use Arc properly
        None
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub user_id: String,
    pub access_token: String,
    pub refresh_token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Device {
    pub id: String,
    pub user_id: String,
    pub platform: String,
    pub device_label: Option<String>,
    pub push_token: Option<String>,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupabaseAccount {
    pub id: String,
    pub user_id: String,
    pub chain: String,
    pub address: String,
    #[serde(rename = "type")]
    pub account_type: String,
    pub is_default: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct AuthResponse {
    session: Option<SessionData>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SessionData {
    user: UserData,
    access_token: String,
    refresh_token: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct UserData {
    id: String,
}

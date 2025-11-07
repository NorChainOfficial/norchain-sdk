/**
 * Supabase service for Web
 * Mirrors iOS SupabaseService.swift functionality
 */

import { supabase } from './supabase-client';
import { SupabaseConfig } from './supabase-config';
import { Session, User } from '@supabase/supabase-js';

export interface Device {
  id: string;
  user_id: string;
  platform: string;
  device_label: string | null;
  push_token: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SupabaseAccount {
  id: string;
  user_id: string;
  chain: string;
  address: string;
  type: string;
  is_default: boolean;
  created_at: string;
}

export interface TxRecord {
  id: number;
  user_id: string;
  chain: string;
  account_address: string;
  tx_hash: string;
  status: string;
  direction: string;
  asset: string;
  value: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  kind: string;
  request: Record<string, any>;
  status: string;
  result: Record<string, any> | null;
  created_at: string;
}

export class SupabaseService {
  private static instance: SupabaseService;
  private currentSession: Session | null = null;
  private sessionListeners: Set<(session: Session | null) => void> = new Set();

  private constructor() {
    // Check existing session on init
    this.checkSession();
    this.observeAuthChanges();
  }

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // MARK: - Authentication

  async checkSession(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this.currentSession = session;
      this.notifySessionListeners(session);
    } catch (error) {
      if (SupabaseConfig.enableDebugLogging) {
        console.warn('Session check failed:', error);
      }
      this.currentSession = null;
      this.notifySessionListeners(null);
    }
  }

  async signUp(email: string, password: string): Promise<Session> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.session) throw new Error('No session returned');

    this.currentSession = data.session;
    this.notifySessionListeners(data.session);
    return data.session;
  }

  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.session) throw new Error('No session returned');

    this.currentSession = data.session;
    this.notifySessionListeners(data.session);
    return data.session;
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.currentSession = null;
    this.notifySessionListeners(null);
  }

  private observeAuthChanges(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      this.currentSession = session;
      this.notifySessionListeners(session);
    });
  }

  private notifySessionListeners(session: Session | null): void {
    this.sessionListeners.forEach(listener => listener(session));
  }

  onSessionChange(listener: (session: Session | null) => void): () => void {
    this.sessionListeners.add(listener);
    return () => this.sessionListeners.delete(listener);
  }

  // MARK: - Devices

  async registerDevice(
    platform: string,
    label: string,
    pushToken: string | null
  ): Promise<Device> {
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('devices')
      .insert({
        user_id: this.currentSession.user.id,
        platform,
        device_label: label,
        push_token: pushToken,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Device;
  }

  // MARK: - Accounts

  async createAccount(
    chain: string,
    address: string,
    type: string = 'EOA',
    isDefault: boolean = false
  ): Promise<SupabaseAccount> {
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: this.currentSession.user.id,
        chain,
        address,
        type,
        is_default: isDefault,
      })
      .select()
      .single();

    if (error) throw error;
    return data as SupabaseAccount;
  }

  async fetchAccounts(): Promise<SupabaseAccount[]> {
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', this.currentSession.user.id);

    if (error) throw error;
    return (data || []) as SupabaseAccount[];
  }

  // MARK: - Transaction History

  async createTransaction(params: {
    chain: string;
    accountAddress: string;
    txHash: string;
    status: string;
    direction: string;
    asset: string;
    value: string | null;
  }): Promise<TxRecord> {
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('tx_history')
      .insert({
        user_id: this.currentSession.user.id,
        chain: params.chain,
        account_address: params.accountAddress,
        tx_hash: params.txHash,
        status: params.status,
        direction: params.direction,
        asset: params.asset,
        value: params.value,
      })
      .select()
      .single();

    if (error) throw error;
    return data as TxRecord;
  }

  async fetchTransactions(chain?: string, limit: number = 50): Promise<TxRecord[]> {
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    let query = supabase
      .from('tx_history')
      .select('*')
      .eq('user_id', this.currentSession.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (chain) {
      query = query.eq('chain', chain);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as TxRecord[];
  }

  // MARK: - Jobs

  async fetchJobs(status?: string): Promise<Job[]> {
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', this.currentSession.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Job[];
  }

  // MARK: - Edge Functions

  async initiateBridge(
    fromChain: string,
    toChain: string,
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<Job> {
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('bridge-initiate', {
      body: {
        from_chain: fromChain,
        to_chain: toChain,
        from_token: fromToken,
        to_token: toToken,
        amount,
      },
    });

    if (error) throw error;
    return data as Job;
  }

  // Getters
  get session(): Session | null {
    return this.currentSession;
  }

  get isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  get user(): User | null {
    return this.currentSession?.user || null;
  }
}


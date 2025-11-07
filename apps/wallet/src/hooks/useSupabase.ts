/**
 * React hook for Supabase authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { SupabaseService } from '@/lib/supabase-service';
import { Session } from '@supabase/supabase-js';

export function useSupabase() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseService = SupabaseService.getInstance();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        await supabaseService.checkSession();
        setSession(supabaseService.session);
        setIsAuthenticated(supabaseService.isAuthenticated);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const unsubscribe = supabaseService.onSessionChange((newSession) => {
      setSession(newSession);
      setIsAuthenticated(!!newSession);
    });

    return () => unsubscribe();
  }, [supabaseService]);

  const signUp = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await supabaseService.signUp(email, password);
      setSession(newSession);
      setIsAuthenticated(true);
      return newSession;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabaseService]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await supabaseService.signIn(email, password);
      setSession(newSession);
      setIsAuthenticated(true);
      return newSession;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabaseService]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await supabaseService.signOut();
      setSession(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabaseService]);

  return {
    session,
    isAuthenticated,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    user: session?.user || null,
  };
}


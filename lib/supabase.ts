
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Villa } from '../types';
import { SUPABASE_CONFIG } from '../supabase-config';

// Access credentials from config file or environment variables
const supabaseUrl = (process.env as any).SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

// Only initialize the client if both credentials are provided
export const supabaseClient: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabaseClient) {
  console.warn(
    "Supabase configuration is missing. Please set 'url' and 'anonKey' in 'supabase-config.ts' " +
    "or provide SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables."
  );
}

// Helper to ensure client exists before calling methods
const checkClient = () => {
  if (!supabaseClient) {
    throw new Error("Supabase client is not initialized. Check your 'supabase-config.ts' file.");
  }
  return supabaseClient;
};

export const supabase = {
  async getVillas() {
    try {
      const client = checkClient();
      const { data, error } = await client
        .from('villas')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error: error?.message };
    } catch (e: any) {
      console.error("Supabase Error (getVillas):", e.message);
      return { data: [], error: e.message };
    }
  },

  async getVillaById(id: string) {
    try {
      const client = checkClient();
      const { data, error } = await client
        .from('villas')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error: error?.message };
    } catch (e: any) {
      console.error("Supabase Error (getVillaById):", e.message);
      return { data: null, error: e.message };
    }
  },

  async saveVilla(villa: Partial<Villa>) {
    try {
      const client = checkClient();
      if (villa.id) {
        const { data, error } = await client
          .from('villas')
          .update(villa)
          .eq('id', villa.id)
          .select()
          .single();
        return { data, error: error?.message };
      } else {
        const { data, error } = await client
          .from('villas')
          .insert([villa])
          .select()
          .single();
        return { data, error: error?.message };
      }
    } catch (e: any) {
      console.error("Supabase Error (saveVilla):", e.message);
      return { data: null, error: e.message };
    }
  },

  async deleteVilla(id: string) {
    try {
      const client = checkClient();
      const { error } = await client
        .from('villas')
        .delete()
        .eq('id', id);
      return { error: error?.message };
    } catch (e: any) {
      console.error("Supabase Error (deleteVilla):", e.message);
      return { error: e.message };
    }
  },

  async signIn(email: string, password?: string) {
    try {
      const client = checkClient();
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password: password || 'temporary-password', 
      });
      return { data, error: error?.message };
    } catch (e: any) {
      console.error("Supabase Error (signIn):", e.message);
      return { data: null, error: e.message };
    }
  },

  async signOut() {
    try {
      const client = checkClient();
      const { error } = await client.auth.signOut();
      return { error: error?.message };
    } catch (e: any) {
      console.error("Supabase Error (signOut):", e.message);
      return { error: e.message };
    }
  },

  getCurrentUser() {
    if (!supabaseClient || !supabaseUrl) return null;
    
    try {
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
      if (!projectRef) return null;
      
      const storageKey = `sb-${projectRef}-auth-token`;
      const sessionStr = localStorage.getItem(storageKey);
      
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return session.user;
      }
    } catch (e) {
      console.error("Error parsing Supabase session:", e);
    }
    return null;
  }
};

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Villa, VillaCategory } from '../types';
import { SUPABASE_CONFIG } from '../supabase-config';

// Access credentials from config file or environment variables
const supabaseUrl = (process.env as any).SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

// Only initialize the client if both credentials are provided
export const supabaseClient: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- Mock Data & Local Storage Implementation for Demo Mode ---

const MOCK_VILLAS: Villa[] = [
  {
    id: 'mock-1',
    name: 'Azure Horizon Mansion',
    description: 'A stunning beachfront masterpiece with panoramic ocean views, private infinity pool, and direct access to a secluded white sand beach. Features floor-to-ceiling windows and a professional-grade kitchen.',
    location_link: 'https://maps.google.com',
    category: VillaCategory.Beachfront,
    price: 1250,
    facilities: ['Infinity Pool', 'Private Beach', 'Chef Service', 'Home Cinema', 'Gym'],
    is_available: true,
    photo_url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200',
    service_fee: 150,
    marketing_caption: 'Where the sky meets the sea in perfect harmony. Experience coastal living at its finest.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    name: 'Ethereal Peak Retreat',
    description: 'Perched high in the Alps, this modern chalet offers unmatched luxury. Enjoy a heated outdoor spa, stone fireplaces, and ski-in/ski-out access for the ultimate mountain getaway.',
    location_link: 'https://maps.google.com',
    category: VillaCategory.Mountain,
    price: 980,
    facilities: ['Outdoor Spa', 'Ski Access', 'Fireplace', 'Wine Cellar'],
    is_available: true,
    photo_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200',
    service_fee: 120,
    marketing_caption: 'Touch the clouds and find your peace in the majesty of the mountains.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    name: 'Olive Grove Estate',
    description: 'An expansive 18th-century farmhouse beautifully restored with contemporary amenities. Surrounded by century-old olive trees and vineyards in the heart of Tuscany.',
    location_link: 'https://maps.google.com',
    category: VillaCategory.Countryside,
    price: 750,
    facilities: ['Vineyard', 'Heated Pool', 'Outdoor Kitchen', 'Bicycles'],
    is_available: true,
    photo_url: 'https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&q=80&w=1200',
    service_fee: 90,
    marketing_caption: 'Authentic rustic charm meets modern elegance in the golden hills.',
    created_at: new Date().toISOString(),
  }
];

const LOCAL_STORAGE_KEY = 'luxevilla_demo_villas';
const AUTH_STORAGE_KEY = 'luxevilla_demo_auth';

const getLocalVillas = (): Villa[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_VILLAS));
    return MOCK_VILLAS;
  }
  return JSON.parse(stored);
};

const saveLocalVillas = (villas: Villa[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(villas));
};

// --- Resilient Supabase Wrapper ---

export const supabase = {
  async getVillas() {
    if (!supabaseClient) {
      console.log("Running in Demo Mode: Fetching local villas");
      return { data: getLocalVillas(), error: null };
    }
    try {
      const { data, error } = await supabaseClient
        .from('villas')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error: error?.message };
    } catch (e: any) {
      return { data: getLocalVillas(), error: e.message };
    }
  },

  async getVillaById(id: string) {
    if (!supabaseClient) {
      const villas = getLocalVillas();
      const villa = villas.find(v => v.id === id);
      return { data: villa || null, error: villa ? null : 'Villa not found' };
    }
    try {
      const { data, error } = await supabaseClient
        .from('villas')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error: error?.message };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async saveVilla(villa: Partial<Villa>) {
    if (!supabaseClient) {
      const villas = getLocalVillas();
      let updatedVillas: Villa[];
      let savedVilla: Villa;

      if (villa.id) {
        updatedVillas = villas.map(v => v.id === villa.id ? { ...v, ...villa } as Villa : v);
        savedVilla = updatedVillas.find(v => v.id === villa.id)!;
      } else {
        savedVilla = {
          ...villa,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString()
        } as Villa;
        updatedVillas = [savedVilla, ...villas];
      }
      
      saveLocalVillas(updatedVillas);
      return { data: savedVilla, error: null };
    }

    try {
      if (villa.id) {
        const { data, error } = await supabaseClient
          .from('villas')
          .update(villa)
          .eq('id', villa.id)
          .select()
          .single();
        return { data, error: error?.message };
      } else {
        const { data, error } = await supabaseClient
          .from('villas')
          .insert([villa])
          .select()
          .single();
        return { data, error: error?.message };
      }
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async deleteVilla(id: string) {
    if (!supabaseClient) {
      const villas = getLocalVillas();
      const filtered = villas.filter(v => v.id !== id);
      saveLocalVillas(filtered);
      return { error: null };
    }
    try {
      const { error } = await supabaseClient
        .from('villas')
        .delete()
        .eq('id', id);
      return { error: error?.message };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  async signIn(email: string, password?: string) {
    if (!supabaseClient) {
      // Mock successful login in demo mode
      const mockUser = { id: 'demo-user-123', email };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password: password || 'temporary-password', 
      });
      return { data, error: error?.message };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async signOut() {
    if (!supabaseClient) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return { error: null };
    }
    try {
      const { error } = await supabaseClient.auth.signOut();
      return { error: error?.message };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  getCurrentUser() {
    if (!supabaseClient) {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
    
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

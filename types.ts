
export interface Villa {
  id: number;
  created_at: string;
  name: string;
  description: string;
  facilities: string[];
  price: number;
  commission: number;
  google_maps_link: string;
  photo_link: string;
  owner_phone: string;
  is_available: boolean;
  marketing_caption: string;
}

export type NewVilla = Omit<Villa, 'id' | 'created_at'>;

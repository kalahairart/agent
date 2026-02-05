
import React, { useEffect, useState } from 'https://esm.sh/react@19.2.4';
import { useParams, Link } from 'https://esm.sh/react-router-dom@7.13.0';
import { Villa } from '../types';
import { supabase } from '../lib/supabase';

export const VillaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVilla = async () => {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase.getVillaById(id);
      setVilla(data || null);
      setLoading(false);
    };
    fetchVilla();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>
  );

  if (!villa) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Villa Not Found</h2>
      <Link to="/" className="text-amber-600 hover:underline">Return to home</Link>
    </div>
  );

  return (
    <div className="pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          <div className="md:col-span-8 overflow-hidden rounded-3xl shadow-lg h-[400px] md:h-[600px]">
            <img src={villa.photo_url} alt={villa.name} className="w-full h-full object-cover" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex-grow">
              <span className="text-amber-600 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">{villa.category}</span>
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-6">{villa.name}</h1>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-3xl font-bold text-slate-900">${villa.price}</span>
                <span className="text-slate-400">/ night</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="font-medium text-slate-900">${villa.service_fee}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-bold ${villa.is_available ? 'text-green-600' : 'text-red-500'}`}>
                    {villa.is_available ? 'Available Now' : 'Currently Booked'}
                  </span>
                </div>
              </div>

              <button 
                disabled={!villa.is_available}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md ${
                  villa.is_available 
                    ? 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-xl active:scale-95' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {villa.is_available ? 'Reserve Your Stay' : 'Fully Booked'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">About the Villa</h2>
              <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line mb-8">
                {villa.description}
              </p>
              {villa.marketing_caption && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl">
                  <p className="text-amber-900 italic font-medium leading-relaxed">
                    "{villa.marketing_caption}"
                  </p>
                </div>
              )}
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {villa.facilities.map((facility) => (
                  <div key={facility} className="flex items-center space-x-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-slate-700 font-medium">{facility}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Location</h2>
              <a 
                href={villa.location_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block relative rounded-3xl overflow-hidden h-[300px] border border-slate-200"
              >
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-xl transform group-hover:scale-105 transition-transform">
                    View on Google Maps
                  </span>
                </div>
                <img 
                  src={`https://picsum.photos/seed/${villa.id}/1200/600`} 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" 
                  alt="Map Placeholder" 
                />
              </a>
            </section>
          </div>

          <div className="lg:col-span-1">
             <div className="sticky top-24 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl">
                <h3 className="text-xl font-bold mb-6">Booking Details</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Check-In</label>
                    <input type="date" className="w-full bg-slate-800 border-none rounded-xl text-white p-3 focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Check-Out</label>
                    <input type="date" className="w-full bg-slate-800 border-none rounded-xl text-white p-3 focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Guests</label>
                    <select className="w-full bg-slate-800 border-none rounded-xl text-white p-3 focus:ring-2 focus:ring-amber-500 outline-none">
                      <option>1 Adult</option>
                      <option>2 Adults</option>
                      <option>2 Adults + 2 Kids</option>
                      <option>4 Adults</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white">${villa.price} x 1 night</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Service Fee</span>
                    <span className="text-white">${villa.service_fee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-amber-400">${villa.price + villa.service_fee}</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Villa, VillaCategory } from '../types';
import { supabase } from '../lib/supabase';

export const Home: React.FC = () => {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<VillaCategory | 'All'>('All');

  useEffect(() => {
    const fetchVillas = async () => {
      setLoading(true);
      const { data } = await supabase.getVillas();
      setVillas(data || []);
      setLoading(false);
    };
    fetchVillas();
  }, []);

  const filteredVillas = activeFilter === 'All' 
    ? villas 
    : villas.filter(v => v.category === activeFilter);

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
          alt="Luxury Villa"
        />
        <div className="relative text-center px-4">
          <h1 className="text-4xl md:text-6xl text-white font-bold mb-6 tracking-tight">
            Exceptional Stays for <br/><span className="italic text-amber-400">Exceptional People</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Curated selection of the world's most prestigious private villas.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-wrap items-center justify-center gap-2">
          {['All', ...Object.values(VillaCategory)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat as any)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === cat 
                  ? 'bg-amber-600 text-white shadow-lg' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Villa Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-200 aspect-[4/3] rounded-2xl mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVillas.map((villa) => (
                <Link 
                  key={villa.id} 
                  to={`/villa/${villa.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={villa.photo_url} 
                      alt={villa.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-800">
                      {villa.category}
                    </div>
                    {!villa.is_available && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-white text-slate-900 px-4 py-1.5 rounded-full font-bold text-sm">NOT AVAILABLE</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{villa.name}</h3>
                      <p className="text-amber-600 font-bold text-lg">${villa.price}<span className="text-slate-400 text-xs font-normal">/night</span></p>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                      {villa.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {villa.facilities.slice(0, 3).map((f) => (
                        <span key={f} className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 border border-slate-100 rounded">
                          {f}
                        </span>
                      ))}
                      {villa.facilities.length > 3 && (
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded">
                          +{villa.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filteredVillas.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-400 text-lg italic">No villas found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

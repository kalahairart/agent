
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Villa, VillaCategory } from '../types';
import { supabase } from '../lib/supabase';
import { generateMarketingCaption } from '../services/geminiService';

export const AdminDashboard: React.FC = () => {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVilla, setCurrentVilla] = useState<Partial<Villa>>({});
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = supabase.getCurrentUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }
    fetchVillas();
  }, [navigate]);

  const fetchVillas = async () => {
    setLoading(true);
    const { data } = await supabase.getVillas();
    setVillas(data || []);
    setLoading(false);
  };

  const handleEdit = (villa: Villa) => {
    setCurrentVilla(villa);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this villa?')) {
      await supabase.deleteVilla(id);
      fetchVillas();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.saveVilla(currentVilla);
    setIsEditing(false);
    setCurrentVilla({});
    fetchVillas();
  };

  const handleGenerateAiCaption = async () => {
    if (!currentVilla.name || !currentVilla.description) {
      alert("Please provide at least a name and description first.");
      return;
    }
    setAiLoading(true);
    const caption = await generateMarketingCaption(currentVilla);
    setCurrentVilla({ ...currentVilla, marketing_caption: caption });
    setAiLoading(false);
  };

  if (loading) return <div className="p-20 text-center">Loading portfolio...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Villa Portfolio</h1>
          <p className="text-slate-500">Manage and optimize your property listings.</p>
        </div>
        <button 
          onClick={() => { setCurrentVilla({ facilities: [], is_available: true, category: VillaCategory.Beachfront }); setIsEditing(true); }}
          className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-amber-700 transition-all flex items-center space-x-2"
        >
          <span>+ Add New Villa</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Villa Details</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Category</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Price</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {villas.map((villa) => (
              <tr key={villa.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-6">
                  <div className="flex items-center space-x-4">
                    <img src={villa.photo_url} className="w-16 h-12 object-cover rounded-lg" alt={villa.name} />
                    <div>
                      <p className="font-bold text-slate-900">{villa.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{villa.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                    {villa.category}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <p className="font-bold text-slate-900">${villa.price}<span className="text-slate-400 text-[10px] font-normal">/night</span></p>
                </td>
                <td className="px-6 py-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    villa.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {villa.is_available ? 'Active' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleEdit(villa)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(villa.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                {currentVilla.id ? 'Edit Villa' : 'Add New Villa'}
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">&times; Close</button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Villa Name</label>
                    <input 
                      type="text" required
                      value={currentVilla.name || ''}
                      onChange={e => setCurrentVilla({ ...currentVilla, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Category</label>
                    <select 
                      value={currentVilla.category || VillaCategory.Beachfront}
                      onChange={e => setCurrentVilla({ ...currentVilla, category: e.target.value as VillaCategory })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {Object.values(VillaCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Price per Night ($)</label>
                    <input 
                      type="number" required
                      value={currentVilla.price || ''}
                      onChange={e => setCurrentVilla({ ...currentVilla, price: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Service Fee ($)</label>
                    <input 
                      type="number"
                      value={currentVilla.service_fee || ''}
                      onChange={e => setCurrentVilla({ ...currentVilla, service_fee: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Photo URL</label>
                    <input 
                      type="url" required
                      value={currentVilla.photo_url || ''}
                      onChange={e => setCurrentVilla({ ...currentVilla, photo_url: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" 
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-4">
                    <input 
                      type="checkbox"
                      id="avail"
                      checked={currentVilla.is_available}
                      onChange={e => setCurrentVilla({ ...currentVilla, is_available: e.target.checked })}
                      className="w-5 h-5 accent-amber-600"
                    />
                    <label htmlFor="avail" className="text-sm font-medium text-slate-700">Available for booking</label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                    <textarea 
                      rows={4} required
                      value={currentVilla.description || ''}
                      onChange={e => setCurrentVilla({ ...currentVilla, description: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 resize-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Google Maps Link</label>
                    <input 
                      type="url"
                      value={currentVilla.location_link || ''}
                      onChange={e => setCurrentVilla({ ...currentVilla, location_link: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Facilities (comma separated)</label>
                    <input 
                      type="text"
                      value={currentVilla.facilities?.join(', ') || ''}
                      onChange={e => setCurrentVilla({ ...currentVilla, facilities: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" 
                      placeholder="Pool, WiFi, Gym..."
                    />
                  </div>
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-bold text-amber-700 uppercase tracking-widest">AI Marketing Caption</label>
                      <button 
                        type="button"
                        onClick={handleGenerateAiCaption}
                        disabled={aiLoading}
                        className="text-[10px] bg-amber-600 text-white px-3 py-1.5 rounded-full font-bold hover:bg-amber-700 transition-colors disabled:bg-amber-300"
                      >
                        {aiLoading ? 'Magic in progress...' : '✨ Generate with Gemini AI'}
                      </button>
                    </div>
                    <textarea 
                      rows={3}
                      value={currentVilla.marketing_caption || ''}
                      onChange={e => setCurrentVilla({ ...currentVilla, marketing_caption: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-amber-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm text-amber-900 placeholder-amber-300"
                      placeholder="A short, catchy marketing blurb for social media..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
                <button 
                  type="button" onClick={() => setIsEditing(false)}
                  className="px-6 py-3 text-slate-500 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

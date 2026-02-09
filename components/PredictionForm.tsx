
import React, { useState, useEffect, useRef } from 'react';
import { PropertyDetails } from '../types';
import { Search, MapPin, Maximize, Activity, Calendar, ArrowRight, ArrowLeft, CheckCircle2, Crosshair, Loader2, Camera, Upload, Trash2, Building2, Home, Landmark, TreePine, Factory, Briefcase } from 'lucide-react';

interface PredictionFormProps {
  onSubmit: (details: PropertyDetails) => void;
  isLoading: boolean;
}

const AMENITIES_OPTIONS = [
  'Metro Access', 'Schools', 'Hospitals', 'Parks', 'High-Street Retail', 'Gym', 'Gated Community', 'Smart-Home Tech', 'Waterfront', 'Highway Proximity'
];

const PROPERTY_TYPES = [
  { id: 'Apartment', label: 'Apartment', icon: Building2 },
  { id: 'Individual House', label: 'Individual House', icon: Home },
  { id: 'Commercial Space', label: 'Commercial', icon: Briefcase },
  { id: 'Empty Land', label: 'Empty Land', icon: TreePine },
  { id: 'Industrial Land', label: 'Industrial', icon: Factory },
  { id: 'Agricultural Land', label: 'Agricultural', icon: Landmark },
];

export const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [details, setDetails] = useState<PropertyDetails>({
    location: '',
    lat: 28.6139,
    lng: 77.2090,
    size: 1000,
    unit: 'sqft',
    type: 'Apartment',
    amenities: [],
    age: 0,
    condition: 'New',
    image: undefined
  });

  const fetchAddress = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await response.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        const shortAddress = parts.length > 3 ? parts.slice(0, 3).join(',') : data.display_name;
        setDetails(prev => ({ ...prev, location: shortAddress }));
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const fetchCoords = async (query: string) => {
    if (!query || query.length < 3) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setDetails(prev => ({ ...prev, lat: newLat, lng: newLng }));
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([newLat, newLng], 14);
          markerRef.current.setLatLng([newLat, newLng]);
        }
      }
    } catch (error) {
      console.error("Forward geocoding failed", error);
    }
  };

  useEffect(() => {
    if (step === 1 && mapContainerRef.current && !mapRef.current && (window as any).L) {
      const L = (window as any).L;
      mapRef.current = L.map(mapContainerRef.current).setView([details.lat, details.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapRef.current);
      markerRef.current = L.marker([details.lat, details.lng], { draggable: true }).addTo(mapRef.current);
      
      const updateCoords = (e: any) => {
        const coords = e.target.getLatLng ? e.target.getLatLng() : e.latlng;
        setDetails(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
        fetchAddress(coords.lat, coords.lng);
      };
      markerRef.current.on('dragend', updateCoords);
      mapRef.current.on('click', (e: any) => {
        markerRef.current.setLatLng(e.latlng);
        updateCoords(e);
      });
    }
    return () => {
      if (mapRef.current) { mapRef.current.off(); mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
    };
  }, [step]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDetails(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setDetails(prev => ({ ...prev, lat: latitude, lng: longitude }));
        mapRef.current.setView([latitude, longitude], 16);
        markerRef.current.setLatLng([latitude, longitude]);
        fetchAddress(latitude, longitude);
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: name === 'size' || name === 'age' ? Number(value) : value }));
  };

  const toggleAmenity = (amenity: string) => {
    setDetails(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity]
    }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <label className="text-lg font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-2"><MapPin className="text-emerald-500" /> Geographic Node</span>
                <button type="button" onClick={handleLocateMe} className="text-xs flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold">
                  <Crosshair size={14} /> Locate Me
                </button>
              </label>
              <div ref={mapContainerRef} className="h-[250px] border-2 border-slate-100 rounded-3xl overflow-hidden shadow-inner relative z-0" />
              <div className="relative">
                <input required type="text" name="location" value={details.location} onChange={handleChange} placeholder="Address or Area Name" className="w-full text-lg px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 transition-all outline-none pl-12 pr-24" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {isGeocoding ? <Loader2 size={20} className="animate-spin text-emerald-500" /> : <Search size={20} />}
                </div>
                <button type="button" onClick={() => fetchCoords(details.location)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-xl">Pin Location</button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <label className="text-lg font-bold text-slate-800">Property Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = details.type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setDetails(prev => ({ ...prev, type: type.id as any }))}
                      className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 ${
                        isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md scale-[1.02]' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <Icon size={24} className={isActive ? 'text-emerald-500' : 'text-slate-300'} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Area / Size</label>
                <div className="flex rounded-xl border-2 border-slate-100 overflow-hidden">
                  <input type="number" name="size" value={details.size} onChange={handleChange} className="flex-1 px-4 py-3 outline-none" />
                  <select name="unit" value={details.unit} onChange={handleChange} className="bg-slate-50 px-2 font-bold text-xs border-l-2 border-slate-100">
                    <option value="sqft">Sq Ft</option>
                    <option value="acre">Acres</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Property Age</label>
                <input type="number" name="age" value={details.age} onChange={handleChange} placeholder="0 for New" className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none" />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="space-y-4">
              <label className="text-lg font-bold text-slate-800">Visuals & Condition</label>
              <div className="flex items-center gap-4 mb-6">
                {details.image ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-emerald-100">
                    <img src={details.image} alt="Property" className="w-full h-full object-cover" />
                    <button onClick={() => setDetails(prev => ({...prev, image: undefined}))} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full shadow-lg"><Trash2 size={16} /></button>
                  </div>
                ) : (
                  <label className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="bg-slate-100 p-4 rounded-full text-slate-400"><Camera size={32} /></div>
                    <span className="text-xs font-bold text-slate-500">Attach Asset Photo (Optional)</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Asset Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {['New', 'Good', 'Fair', 'Needs Renovation'].map(c => (
                    <button key={c} type="button" onClick={() => setDetails({...details, condition: c as any})} className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${details.condition === c ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>{c}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amenities Node</label>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES_OPTIONS.map(a => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)} className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-[10px] font-bold transition-all ${details.amenities.includes(a) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                      <CheckCircle2 size={12} className={details.amenities.includes(a) ? 'text-emerald-500' : 'text-slate-200'} /> {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8 flex gap-3">
        {[1, 2, 3].map(i => <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-700 ${step >= i ? 'bg-emerald-500 shadow-lg' : 'bg-slate-200'}`} />)}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(details); }} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl relative">
        <div className="min-h-[400px]">{renderStep()}</div>
        <div className="mt-8 flex gap-4">
          {step > 1 && <button type="button" onClick={prevStep} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold transition-colors hover:bg-slate-200"><ArrowLeft size={20} /></button>}
          {step < 3 ? (
            <button type="button" disabled={step === 1 && !details.location} onClick={nextStep} className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black disabled:opacity-50 transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-100">Continue</button>
          ) : (
            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black disabled:opacity-50 transition-all hover:bg-slate-800 shadow-xl shadow-slate-200">{isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Execute Precision Valuation'}</button>
          )}
        </div>
      </form>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { editPropertyImage } from '../services/geminiService';
import { PredictionResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, LabelList, Bar, Cell, BarChart } from 'recharts';
import { Sparkles, Wand2, RefreshCcw, Download, Loader2, ArrowLeft, TrendingUp, BarChart3, Database, Percent } from 'lucide-center';
import { ArrowLeft as ArrowLeftIcon, TrendingUp as TrendingUpIcon, BarChart3 as BarChartIcon, Database as DatabaseIcon, Sparkles as SparklesIcon, Wand2 as WandIcon, RefreshCcw as RefreshIcon, Download as DownloadIcon, Loader2 as LoaderIcon } from 'lucide-react';

interface MediaEditorProps {
  initialImage: string;
  propertyType: string;
  prediction: PredictionResult;
  onBack: () => void;
}

const formatRupeeShort = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const CustomGraphTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload.find((p: any) => p.dataKey === 'price')?.value;
    const high = payload.find((p: any) => p.dataKey === 'high')?.value;
    const low = payload.find((p: any) => p.dataKey === 'low')?.value;
    
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
        <p className="text-white font-black text-sm mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Valuation</p>
          <p className="text-emerald-400 font-black text-xl">{formatRupeeShort(value)}</p>
          {low && high && (
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">
              Band: {formatRupeeShort(low)} - {formatRupeeShort(high)}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const ROITooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const roi = payload[0].value;
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl">
        <p className="text-white font-black text-[10px] mb-1 uppercase tracking-widest">{label} ROI Velocity</p>
        <p className={`font-black text-lg ${roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export const MediaEditor: React.FC<MediaEditorProps> = ({ initialImage, propertyType, prediction, onBack }) => {
  const [currentImage, setCurrentImage] = useState(initialImage);
  const [history, setHistory] = useState<string[]>([initialImage]);
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const roiData = useMemo(() => {
    return prediction.marketTrends.map((item, idx, arr) => {
      if (idx === 0) return { period: item.period, roi: 0 };
      const prev = arr[idx - 1].price;
      const roi = ((item.price - prev) / prev) * 100;
      return { period: item.period, roi };
    }).filter(d => d.roi !== 0);
  }, [prediction.marketTrends]);

  const handleEdit = async () => {
    if (!prompt.trim() || isEditing) return;
    setIsEditing(true);
    try {
      const result = await editPropertyImage(currentImage, prompt, propertyType);
      setCurrentImage(result);
      setHistory(prev => [...prev, result]);
      setPrompt('');
    } catch (e) {
      alert("AI Editing failed. Try a different prompt.");
    } finally {
      setIsEditing(false);
    }
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setCurrentImage(newHistory[newHistory.length - 1]);
      setHistory(newHistory);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors">
          <ArrowLeftIcon size={20} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
          <SparklesIcon size={14} /> Multimodal Intelligence Hub
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: AI Visualizer & Graphs */}
        <div className="xl:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <WandIcon className="text-emerald-500" /> Visual Re-rendering
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Modeling as: {propertyType}</p>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-full">Nano Banana v2.5</div>
            </div>

            <div className="bg-slate-900 rounded-[40px] p-2 overflow-hidden shadow-2xl relative aspect-video">
              <img src={currentImage} alt="Edited Property" className="w-full h-full object-cover rounded-[36px]" />
              {isEditing && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <LoaderIcon size={48} className="animate-spin text-emerald-400 mb-4" />
                  <p className="font-black tracking-widest uppercase text-xs">Architectural nodes syncing...</p>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
               <button onClick={undo} disabled={history.length <= 1} className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 hover:bg-slate-100 transition-colors">
                 <RefreshIcon size={18} /> Revert Changes
               </button>
               <a href={currentImage} download="ps-valuation-ai.png" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                 <DownloadIcon size={18} /> Export Asset
               </a>
            </div>
          </div>

          {/* Visualization Graphs Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trajectory Graph */}
            <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm space-y-6 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <TrendingUpIcon className="text-emerald-500" size={20} /> Trajectory
                </h3>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={prediction.marketTrends} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="visRangeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                    <YAxis hide />
                    <Tooltip content={<CustomGraphTooltip />} />
                    <Area type="monotone" dataKey="high" stroke="none" fill="url(#visRangeGrad)" baseValue="low" />
                    <Area type="monotone" dataKey="price" fill="url(#visAreaGrad)" stroke="none" />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={{ r: 3, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROI Velocity Graph */}
            <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm space-y-6 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BarChartIcon className="text-blue-500" size={20} /> ROI Velocity
                </h3>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                    <YAxis hide />
                    <Tooltip content={<ROITooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                      {roiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.roi >= 0 ? '#10b981' : '#f43f5e'} opacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Commands */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm sticky top-8 space-y-8">
              <div className="space-y-3">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Command Center</h3>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">Modify visual properties while maintaining market context.</p>
              </div>

              <div className="space-y-5">
                 <div className="space-y-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Visualization Goal</label>
                   <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. 'Add a modern glass facade', 'Change weather to sunset'..."
                      className="w-full h-32 p-5 bg-slate-50 border-2 border-slate-100 rounded-[32px] focus:border-emerald-500 outline-none transition-all resize-none font-medium text-sm leading-relaxed"
                   />
                 </div>
                 
                 <button 
                    onClick={handleEdit}
                    disabled={!prompt.trim() || isEditing}
                    className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                 >
                    {isEditing ? <LoaderIcon size={20} className="animate-spin" /> : <SparklesIcon size={20} className="group-hover:rotate-12 transition-transform" />}
                    Generate Visual Shift
                 </button>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Strategic Presets</p>
                 <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'High-End Finish', p: 'Add luxury materials and premium finishing' },
                      { label: 'Golden Hour', p: 'Sunset lighting and warm shadows' },
                      { label: 'Modern Facade', p: 'Glass and steel architectural update' },
                      { label: 'Lush Garden', p: 'Add high-end landscaping and trees' }
                    ].map(preset => (
                      <button 
                        key={preset.label} 
                        onClick={() => setPrompt(preset.p)} 
                        className="text-[10px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 p-3 rounded-2xl font-bold transition-all border border-transparent hover:border-emerald-100 text-left"
                      >
                        {preset.label}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-50">
                 <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-3xl text-white">
                    <DatabaseIcon size={20} className="text-emerald-400" />
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase">Current Node Value</p>
                      <p className="text-lg font-black">{formatRupeeShort(prediction.predictedPrice)}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

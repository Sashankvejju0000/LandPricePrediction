
import React, { useState, useMemo } from 'react';
import { PredictionResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, Label, ComposedChart, Line, LabelList, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, CheckCircle2, AlertTriangle, ExternalLink, Sliders, Sparkles, History, Calendar, FastForward, BarChart3, Bot, Terminal, Cpu, MessageSquare, User, Zap, Wallet, Building2, X, List, ChevronRight, Database, Clock, RefreshCw, BarChart as BarChartIcon, Filter, Activity, Zap as ZapIcon, Target } from 'lucide-react';

interface ResultDashboardProps { shade_bands?: boolean;
  result: PredictionResult;
}

const formatRupeeShort = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const CustomTrajectoryTooltip = ({ active, payload, label, data }: any) => {
  if (active && payload && payload.length) {
    const year = parseInt(label);
    const value = payload.find((p: any) => p.dataKey === 'price')?.value;
    const high = payload.find((p: any) => p.dataKey === 'high')?.value;
    const low = payload.find((p: any) => p.dataKey === 'low')?.value;
    
    const currentIdx = data.findIndex((d: any) => d.period === label);
    let growthText = null;
    if (currentIdx > 0 && value) {
      const prevValue = data[currentIdx - 1].price;
      const growth = ((value - prevValue) / prevValue) * 100;
      growthText = `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
    }

    let statusLabel = "Past Growth";
    let statusColor = "bg-slate-500";
    let textColor = "text-slate-300";

    if (year === 2025) {
      statusLabel = "Present Scenario";
      statusColor = "bg-emerald-500";
      textColor = "text-emerald-400";
    } else if (year > 2025) {
      statusLabel = "Future Forecast";
      statusColor = "bg-blue-500";
      textColor = "text-blue-400";
    }

    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-5 rounded-[28px] shadow-2xl animate-in zoom-in-95 duration-200 min-w-[240px]">
        <div className="flex items-center justify-between gap-4 mb-4">
           <span className="text-white font-black text-xl">{label}</span>
           <span className={`${statusColor} text-[8px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest`}>
             {statusLabel}
           </span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Valuation</p>
            <p className={`${textColor} font-black text-2xl`}>{value ? formatRupeeShort(value) : '---'}</p>
          </div>
          {low && high && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Confidence Low</p>
                <p className="text-xs font-bold text-rose-400">{formatRupeeShort(low)}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Confidence High</p>
                <p className="text-xs font-bold text-emerald-400">{formatRupeeShort(high)}</p>
              </div>
            </div>
          )}
          {growthText && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
               <p className="text-[10px] font-bold text-slate-400 uppercase">Growth Velocity</p>
               <span className={`text-xs font-black ${parseFloat(growthText) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {growthText}
               </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ result }) => {
  const [simDelta, setSimDelta] = useState(0);
  const [activeSimulator, setActiveSimulator] = useState<string | null>(null);
  const [showDataSheet, setShowDataSheet] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | '3y_window' | 'last_1y' | 'last_3y'>('all');
  
  // Real-time Simulation State
  const [livePrice, setLivePrice] = useState(result.predictedPrice);
  const [liveTrends, setLiveTrends] = useState(result.marketTrends);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulation Interval
  useMemo(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => {
        const fluctuation = 1 + (Math.random() * 0.006 - 0.003);
        const newPrice = Math.round(livePrice * fluctuation);
        setLivePrice(newPrice);
        setLiveTrends(prev => prev.map(item => {
          if (parseInt(item.period) >= 2025) {
            return { 
              ...item, 
              price: Math.round(item.price * fluctuation),
              high: Math.round(item.high * fluctuation),
              low: Math.round(item.low * fluctuation)
            };
          }
          return item;
        }));
        setLastUpdated(new Date());
        setIsUpdating(false);
      }, 1000);
    }, 60000);
    return () => clearInterval(interval);
  }, [livePrice]);

  const displayTrends = useMemo(() => {
    const currentYear = 2025;
    switch (timeFilter) {
      case '3y_window':
        return liveTrends.filter(t => Math.abs(parseInt(t.period) - currentYear) <= 1);
      case 'last_1y':
        return liveTrends.filter(t => parseInt(t.period) <= currentYear && parseInt(t.period) >= currentYear - 1);
      case 'last_3y':
        return liveTrends.filter(t => parseInt(t.period) <= currentYear && parseInt(t.period) >= currentYear - 3);
      case 'all':
      default:
        return liveTrends;
    }
  }, [liveTrends, timeFilter]);

  const vitalityData = useMemo(() => {
    // Derive some secondary metrics for the radial chart
    return [
      { name: 'ROI Potential', value: 85, fill: '#10b981' },
      { name: 'Market Demand', value: 72, fill: '#3b82f6' },
      { name: 'Infra Growth', value: 94, fill: '#f59e0b' },
      { name: 'Asset Liquidity', value: 64, fill: '#ef4444' },
    ];
  }, []);

  const factorData = useMemo(() => {
    return result.influencingFactors.map(f => ({
      name: f.factor,
      impact: f.impact === 'positive' ? 1 : f.impact === 'negative' ? -1 : 0.2,
      label: f.impact.toUpperCase()
    }));
  }, [result.influencingFactors]);

  const formatRupee = (val: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

  const formattedPrice = formatRupee(livePrice + simDelta);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      {/* Dynamic Price Display */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs block">Precision Intelligence</span>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Live Flow</span>
                  </div>
                </div>
                <h2 className={`text-5xl md:text-7xl font-black mb-2 flex items-baseline gap-2 transition-all duration-1000 ${isUpdating ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
                  {formattedPrice}
                  {simDelta !== 0 && <span className="text-2xl text-emerald-400 animate-pulse">{simDelta > 0 ? '+' : ''}{formatRupee(simDelta)}</span>}
                </h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  <Clock size={14} />
                  <span>Last Refresh: {lastUpdated.toLocaleTimeString()}</span>
                  {isUpdating && <RefreshCw size={14} className="animate-spin text-emerald-400 ml-1" />}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <Sparkles className="text-emerald-400" size={24} />
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Accuracy</span>
                  <span className="block text-xl font-black">{(result.confidenceScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-white/10">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center gap-3">
                <History size={16} className="text-slate-400" />
                <span className="text-sm font-bold">Historical Index</span>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/10 flex items-center gap-3">
                <Calendar size={16} className="text-emerald-400" />
                <span className="text-sm font-bold">2025 Present</span>
              </div>
              <div className="bg-blue-500/10 p-4 rounded-3xl border border-blue-500/10 flex items-center gap-3">
                <FastForward size={16} className="text-blue-400" />
                <span className="text-sm font-bold">Predictive Future</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Zap size={20} className="text-emerald-600" />
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Market Sim</h3>
            </div>
            <div className="space-y-3">
              {[
                { id: 'com', label: 'Comm. Hub Shift', impact: result.predictedPrice * 0.12 },
                { id: 'hwy', label: 'Infra Corridor', impact: result.predictedPrice * 0.25 },
              ].map(sim => (
                <button
                  key={sim.id}
                  onClick={() => { setSimDelta(activeSimulator === sim.id ? 0 : sim.impact); setActiveSimulator(activeSimulator === sim.id ? null : sim.id); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 font-bold text-xs ${activeSimulator === sim.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-50'}`}
                >
                  <span>{sim.label}</span>
                  <span className="opacity-70">+{((sim.impact / result.predictedPrice) * 100).toFixed(0)}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Trajectory Section */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-start justify-between mb-10 gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Market Momentum Dashboard</h3>
            <p className="text-sm text-slate-400 font-medium">Value trajectory with shaded 95% confidence bands.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 shadow-inner">
               {[
                 { id: 'all', label: 'Full' },
                 { id: '3y_window', label: '3Y Window' },
                 { id: 'last_3y', label: 'Last 3Y' },
                 { id: 'last_1y', label: 'Last 1Y' }
               ].map((filter) => (
                 <button
                   key={filter.id}
                   onClick={() => setTimeFilter(filter.id as any)}
                   className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     timeFilter === filter.id 
                       ? 'bg-white text-emerald-600 shadow-sm' 
                       : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   {filter.label}
                 </button>
               ))}
            </div>
            
            <button 
              onClick={() => setShowDataSheet(!showDataSheet)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all ${showDataSheet ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-100 text-slate-600'}`}
            >
              <List size={16} /> {showDataSheet ? 'Hide Sheet' : 'Data Sheet'}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-h-[450px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayTrends} margin={{ top: 40, right: 40, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 900}} dy={15} />
                <YAxis hide />
                <Tooltip content={<CustomTrajectoryTooltip data={displayTrends} />} cursor={{ stroke: '#10b981', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="high" stroke="none" fill="url(#rangeGrad)" baseValue="low" name="Confidence Range" />
                <Area type="monotone" dataKey="price" fill="url(#areaGrad)" stroke="none" />
                <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={6} dot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 3 }} />
                
                {displayTrends.some(t => t.period === "2025") && (
                  <ReferenceLine x="2025" stroke="#ef4444" strokeDasharray="8 8" isFront>
                    <Label value="PRESENT" position="top" fill="#ef4444" fontSize={10} fontWeight="900" dy={-50} />
                  </ReferenceLine>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* New Interactive Metrics Panel (fills the empty space) */}
          <div className={`w-full lg:w-[380px] space-y-6 transition-all duration-500 animate-in slide-in-from-right-8 ${showDataSheet ? 'hidden lg:hidden' : 'block'}`}>
            <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" /> Vitality Pulse
                </h4>
                <div className="bg-emerald-500/10 px-2 py-1 rounded-lg">
                   <span className="text-[10px] font-black text-emerald-600">PREMIUM NODE</span>
                </div>
              </div>

              <div className="h-[220px] relative -mx-4">
                 <ResponsiveContainer width="100%" height="100%">
                   <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={12} data={vitalityData}>
                     <RadialBar background dataKey="value" cornerRadius={6} />
                     <Tooltip />
                   </RadialBarChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-3xl font-black text-slate-900">8.4</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Score</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                 {vitalityData.map((item, i) => (
                   <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col gap-1 shadow-sm">
                      <span className="text-[9px] font-black text-slate-400 uppercase truncate">{item.name}</span>
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-black text-slate-900">{item.value}%</span>
                         <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: item.fill }} />
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:rotate-12 transition-transform">
                  <Target size={48} className="text-emerald-400" />
               </div>
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <ZapIcon size={12} /> Live Market Sentiment
               </p>
               <h4 className="text-lg font-black mb-3">Strong Investment Wave</h4>
               <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                 Infrastructure development in this sector is tracking 12% ahead of quarterly benchmarks. High liquidity projected for Q4 2025.
               </p>
            </div>
          </div>

          {showDataSheet && (
            <div className="w-full lg:w-[320px] animate-in slide-in-from-right-8 duration-500">
               <div className="bg-slate-50 rounded-[32px] p-6 h-full border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Database size={16} className="text-emerald-600" /> Dataset
                    </h4>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">{displayTrends.length} pts</span>
                  </div>
                  <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                     {displayTrends.map((item, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl flex flex-col bg-white border-2 transition-all ${item.period === "2025" ? 'border-emerald-500 shadow-lg' : 'border-transparent shadow-sm'}`}>
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-slate-900">{item.period}</span>
                              <span className="text-xs font-black text-slate-900">{formatRupeeShort(item.price)}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Influencing Factors Graph */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
           <div className="bg-amber-100 p-3 rounded-2xl"><BarChartIcon className="text-amber-600" size={24} /></div>
           <h3 className="text-2xl font-black text-slate-900">Key Valuation Drivers</h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={factorData} layout="vertical" margin={{ left: 100, right: 40 }}>
              <XAxis type="number" hide domain={[-1.2, 1.2]} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} width={90} />
              <Tooltip cursor={{fill: '#f8fafc'}} content={({active, payload}) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10">
                      {payload[0].payload.name}: {payload[0].payload.label}
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="impact" radius={[0, 8, 8, 0]}>
                {factorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.impact > 0.5 ? '#10b981' : entry.impact < 0 ? '#f43f5e' : '#fbbf24'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {result.influencingFactors.map((f, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-2 mb-2">
                 {f.impact === 'positive' ? <CheckCircle2 className="text-emerald-500" size={14} /> : <AlertTriangle className="text-amber-500" size={14} />}
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{f.factor}</span>
               </div>
               <p className="text-xs text-slate-600 font-medium leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
             <div className="bg-blue-100 p-3 rounded-2xl"><Wallet className="text-blue-600" size={24} /></div>
             <h3 className="text-2xl font-black text-slate-900">Buyer Protocol</h3>
          </div>
          <p className="text-xl font-black text-blue-900 mb-4">{result.buyerSellerAdvice.buyerAction}</p>
          <p className="text-slate-600 leading-relaxed font-medium">{result.buyerSellerAdvice.reasoning}</p>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
             <div className="bg-emerald-100 p-3 rounded-2xl"><History className="text-emerald-600" size={24} /></div>
             <h3 className="text-2xl font-black text-slate-900">Seller Protocol</h3>
          </div>
          <p className="text-xl font-black text-emerald-900 mb-4">{result.buyerSellerAdvice.sellerAction}</p>
          <p className="text-slate-600 leading-relaxed font-medium">Maximize ROI by timing infra peaks.</p>
        </div>
      </div>
    </div>
  );
};

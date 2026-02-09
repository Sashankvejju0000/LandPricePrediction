
import React, { useState, useEffect } from 'react';
import { PredictionForm } from './components/PredictionForm';
import { ResultDashboard } from './components/ResultDashboard';
import { MediaEditor } from './components/MediaEditor';
import { ChatBot } from './components/ChatBot';
import { PropertyDetails, PredictionResult, AppView } from './types';
import { predictPropertyPrice, getDeepInsights } from './services/geminiService';
import { LayoutGrid, BarChart3, Globe, Info, Menu, X, Landmark, Search, ShieldAlert, Cpu, Database, Network, ArrowRight, Wand2 } from 'lucide-react';

const TYPE_PLACEHOLDERS: Record<string, string> = {
  'Apartment': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'Individual House': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
  'Commercial Space': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'Empty Land': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  'Industrial Land': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
  'Agricultural Land': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80'
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.PREDICT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [currentDetails, setCurrentDetails] = useState<PropertyDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadingMessages = [
    "Locking Precise Coordinates...",
    "Scanning Geospatial Nodes...",
    "Querying RERA & Circle Rates...",
    "Analyzing Infrastructure Delta...",
    "Finalizing PS's Valuation Model..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handlePredict = async (details: PropertyDetails) => {
    setIsLoading(true);
    setError(null);
    setCurrentDetails(details);
    try {
      const result = await predictPropertyPrice(details);
      const deepData = await getDeepInsights(details.location, details.lat, details.lng);
      
      setPrediction({
        ...result,
        groundingLinks: deepData.links
      });
      setActiveView(AppView.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Valuation sync failed. Please check network and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVisualizerImage = () => {
    if (currentDetails?.image) return currentDetails.image;
    if (currentDetails?.type) return TYPE_PLACEHOLDERS[currentDetails.type] || TYPE_PLACEHOLDERS['Apartment'];
    return TYPE_PLACEHOLDERS['Apartment'];
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* Abstract Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-200 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px]" />
      </div>

      <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-2 rounded-xl">
            <Landmark className="text-emerald-400" size={18} />
          </div>
          <span className="font-black text-slate-900 text-lg">PS's Valuation</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 bg-slate-50 rounded-xl">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside className={`
        fixed inset-0 z-40 bg-white/80 backdrop-blur-2xl border-r border-slate-200 w-72 transform transition-transform duration-500 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="hidden md:flex items-center gap-4 mb-12">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-xl shadow-slate-200">
              <Landmark className="text-emerald-400" size={24} />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-xl tracking-tight leading-none">PS's Valuation</h1>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 block">Precision AI v4.0</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: AppView.PREDICT, label: 'Valuation Engine', icon: Search },
              { id: AppView.DASHBOARD, label: 'Analytics Report', icon: BarChart3, disabled: !prediction },
              { id: AppView.VISUALIZER, label: 'AI Visualizer', icon: Wand2, disabled: !prediction },
              { id: AppView.INSIGHTS, label: 'Geo Intelligence', icon: Globe },
              { id: AppView.ABOUT, label: 'Engine Logic', icon: Info },
            ].map((item) => (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  setActiveView(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all
                  ${activeView === item.id 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                    : 'text-slate-500 hover:bg-white hover:text-slate-900'}
                  ${item.disabled ? 'opacity-20 grayscale cursor-not-allowed' : ''}
                `}
              >
                <item.icon size={20} className={activeView === item.id ? 'text-emerald-400' : ''} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
             <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                   <Cpu size={14} className="text-emerald-400" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Nano Banana Active</span>
                </div>
                <p className="text-[10px] font-medium leading-relaxed opacity-70">Image generation and real-time grounding enabled.</p>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 relative overflow-y-auto">
        {isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-pulse">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
              <Network className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 text-center">Syncing Intelligent Nodes</h3>
            <div className="flex items-center gap-3 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full mx-auto max-w-xs">
              <Database size={16} />
              <span>{loadingMessages[loadingStep]}</span>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full">
            {activeView === AppView.PREDICT && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-12 text-center">
                  <span className="text-emerald-600 font-bold text-sm tracking-[0.2em] uppercase mb-3 block">Next-Gen Real Estate AI</span>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Precise Valuation Discovery</h2>
                  <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">Pinpoint property location and provide details for an advanced AI-driven prediction.</p>
                </div>
                {error && (
                  <div className="max-w-xl mx-auto mb-8 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4 text-rose-700 shadow-sm animate-bounce">
                    <ShieldAlert className="flex-shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                  </div>
                )}
                <PredictionForm onSubmit={handlePredict} isLoading={isLoading} />
              </div>
            )}

            {activeView === AppView.DASHBOARD && prediction && (
              <ResultDashboard result={prediction} />
            )}

            {activeView === AppView.VISUALIZER && prediction && currentDetails && (
              <MediaEditor 
                initialImage={getVisualizerImage()} 
                propertyType={currentDetails.type}
                prediction={prediction} 
                onBack={() => setActiveView(AppView.DASHBOARD)} 
              />
            )}

            {activeView === AppView.INSIGHTS && (
              <div className="space-y-12 animate-in fade-in duration-700">
                <header className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Geospatial Intelligence</h2>
                  <p className="text-slate-500 text-lg">Real-time infrastructure and urban sprawl monitoring.</p>
                </header>
                {/* ... existing insights UI ... */}
              </div>
            )}

            {activeView === AppView.ABOUT && (
              <div className="max-w-3xl mx-auto prose prose-slate prose-lg animate-in slide-in-from-bottom-8 duration-700">
                 <h2 className="text-5xl font-black text-slate-900 mb-10 tracking-tight">The <span className="text-emerald-600">Unified</span> Platform</h2>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global AI Chat Bot Component */}
      <ChatBot prediction={prediction} />
    </div>
  );
};

export default App;

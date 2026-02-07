
import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  ShieldAlert, 
  Car, 
  Users, 
  Zap, 
  Search, 
  Globe, 
  ChevronRight, 
  ExternalLink, 
  Loader2, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Info
} from 'lucide-react';
import { fetchLawData } from './services/geminiService';
import { COUNTRIES, CountryInfo, LawResponse, GroundingChunk } from './types';

// Helper to clean markdown and extra spaces
const cleanText = (text: string) => text.replace(/\*\*/g, '').replace(/\[|\]/g, '').trim();

interface ImpactPoint {
  type: 'DO' | 'DONT' | 'WARNING' | 'INFO';
  text: string;
}

interface ParsedSection {
  title: string;
  points: ImpactPoint[];
}

const parseImpactSections = (text: string): ParsedSection[] => {
  const segments = text.split(/(?=^##\s)/m);
  const sections: ParsedSection[] = [];

  segments.forEach(segment => {
    const lines = segment.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return;

    const title = cleanText(lines[0].replace(/^##\s+/, ''));
    const points: ImpactPoint[] = [];

    lines.slice(1).forEach(line => {
      const upper = line.toUpperCase();
      let type: ImpactPoint['type'] = 'INFO';
      let content = line;

      if (upper.includes('DON\'T') || upper.includes('DONT')) {
        type = 'DONT';
        content = line.replace(/\[?DON'T\]?/i, '').trim();
      } else if (upper.includes('DO')) {
        type = 'DO';
        content = line.replace(/\[?DO\]?/i, '').trim();
      } else if (upper.includes('WARNING') || upper.includes('🚨')) {
        type = 'WARNING';
        content = line.replace(/\[?WARNING\]?/i, '').trim();
      }

      const finalContent = cleanText(content.replace(/^[-*]\s*/, ''));
      if (finalContent) {
        points.push({ type, text: finalContent });
      }
    });

    if (title && points.length > 0) {
      sections.push({ title, points });
    }
  });

  return sections;
};

const ActionCard: React.FC<{ point: ImpactPoint }> = ({ point }) => {
  const styles = {
    DONT: {
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      text: 'text-rose-900',
      tag: 'bg-rose-600',
      icon: <XCircle size={18} className="text-rose-600" />,
      label: "DON'T"
    },
    DO: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-900',
      tag: 'bg-emerald-600',
      icon: <CheckCircle2 size={18} className="text-emerald-600" />,
      label: "DO"
    },
    WARNING: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-900',
      tag: 'bg-amber-600',
      icon: <AlertTriangle size={18} className="text-amber-600" />,
      label: "WARNING"
    },
    INFO: {
      bg: 'bg-slate-50',
      border: 'border-slate-100',
      text: 'text-slate-900',
      tag: 'bg-slate-600',
      icon: <Info size={18} className="text-slate-600" />,
      label: "INFO"
    }
  }[point.type];

  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl border ${styles.border} ${styles.bg} transition-all hover:scale-[1.01]`}>
      <div className="mt-1">{styles.icon}</div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded uppercase tracking-wider ${styles.tag}`}>
            {styles.label}
          </span>
        </div>
        <p className={`text-base font-bold leading-snug ${styles.text}`}>
          {point.text}
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<{name: string, flag: string} | null>(null);
  const [lawData, setLawData] = useState<LawResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const parsedSections = useMemo(() => 
    lawData ? parseImpactSections(lawData.text) : [], 
  [lawData]);

  const handleSearch = async (e?: React.FormEvent, countryName?: string, flag?: string) => {
    e?.preventDefault();
    const query = countryName || searchQuery;
    if (!query.trim()) return;

    const existing = COUNTRIES.find(c => c.name.toLowerCase() === query.toLowerCase());
    const finalName = existing?.name || query;
    const finalFlag = flag || existing?.flag || '🌍';

    setSelectedCountry({ name: finalName, flag: finalFlag });
    setLoading(true);
    setError(null);
    setLawData(null);
    
    try {
      const data = await fetchLawData(finalName);
      setLawData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Dynamic Nav */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => { setSelectedCountry(null); setLawData(null); setSearchQuery(''); }}
            className="flex items-center gap-2"
          >
            <div className="bg-slate-900 p-2 rounded-lg text-white">
              <Scale size={18} />
            </div>
            <span className="text-lg font-black tracking-tighter">SafetyNavigator</span>
          </button>
          
          {selectedCountry && !loading && (
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 animate-in fade-in slide-in-from-right-4">
              <span className="text-xl">{selectedCountry.flag}</span>
              <span className="font-black text-xs uppercase tracking-widest">{selectedCountry.name}</span>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {!selectedCountry ? (
          <div className="space-y-16 py-10">
            <div className="text-center space-y-6">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-[0.9]">
                Know the <span className="text-blue-600 italic">Rules.</span><br />
                Avoid the <span className="text-rose-600 underline decoration-4 underline-offset-8">Trouble.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
                Punchy, high-impact legal guides for every country. 
                Don't let a "lesser-known law" ruin your trip.
              </p>
            </div>

            <form onSubmit={handleSearch} className="relative group max-w-xl mx-auto">
              <input
                type="text"
                className="w-full pl-6 pr-40 py-5 bg-white border-2 border-slate-200 rounded-3xl shadow-2xl focus:border-blue-500 transition-all outline-none text-xl font-bold"
                placeholder="Where are you going?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-8 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                Scan <ArrowRight size={18} />
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COUNTRIES.slice(0, 8).map(c => (
                <button 
                  key={c.code}
                  onClick={() => handleSearch(undefined, c.name, c.flag)}
                  className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-center group"
                >
                  <span className="text-3xl block mb-2 group-hover:scale-125 transition-transform">{c.flag}</span>
                  <span className="text-xs font-black uppercase tracking-widest">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
            {loading ? (
              <div className="py-24 text-center space-y-6">
                <Loader2 size={60} className="text-blue-600 animate-spin mx-auto" />
                <div>
                  <h3 className="text-2xl font-black">Scanning Statutes...</h3>
                  <p className="text-slate-400 font-medium">Fetching real-time data for {selectedCountry.name}</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white p-12 rounded-[2.5rem] border-2 border-rose-100 text-center shadow-xl">
                <AlertOctagon size={64} className="text-rose-600 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-rose-900 mb-2">Request Blocked</h3>
                <p className="text-rose-700 font-bold mb-8">{error}</p>
                <button 
                  onClick={() => handleSearch()}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black"
                >
                  Retry Search
                </button>
              </div>
            ) : lawData ? (
              <div className="space-y-12 pb-24">
                {/* Visual Header */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/20 blur-3xl"></div>
                   <div className="relative z-10 flex items-center gap-6">
                     <div className="text-6xl">{selectedCountry.flag}</div>
                     <div>
                       <h2 className="text-4xl font-black tracking-tighter mb-1 uppercase">{selectedCountry.name}</h2>
                       <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Travel Safety Dossier</p>
                     </div>
                   </div>
                </div>

                {/* Impactful Sections */}
                <div className="space-y-10">
                  {parsedSections.map((section, idx) => (
                    <div key={idx} className="space-y-5">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="h-px bg-slate-200 flex-grow"></div>
                        {section.title}
                        <div className="h-px bg-slate-200 flex-grow"></div>
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {section.points.map((point, pIdx) => (
                          <ActionCard key={pIdx} point={point} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sources */}
                {lawData.sources.length > 0 && (
                  <div className="pt-10 border-t border-slate-200">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Sources Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {lawData.sources.slice(0, 5).map((s, i) => s.web?.uri && (
                        <a 
                          key={i} 
                          href={s.web.uri} 
                          target="_blank" 
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                        >
                          <ExternalLink size={10} /> {s.web.title || "Ref"}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center pt-10">
                   <button 
                    onClick={() => { setSelectedCountry(null); setLawData(null); }}
                    className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl hover:-translate-y-1 transition-all"
                  >
                    Check Another Country
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-200 text-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Disclaimer: Information for guidance only. Always verify with official embassies.
        </p>
      </footer>
    </div>
  );
};

export default App;

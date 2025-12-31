
import React, { useState, useRef, useEffect } from 'react';
import { analyzeMessage } from './geminiService';
import { AnalysisResult, RiskLevel, Language } from './types';
import { SAMPLE_MESSAGES } from './constants';
import RiskBadge from './components/RiskBadge';
import AnalysisCard from './components/AnalysisCard';

const App: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('scamshield_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (res: AnalysisResult, original: string, isImg: boolean) => {
    // Fix: replaced undefined variable 'iImg' with 'isImg'
    const newItem = { ...res, timestamp: Date.now(), originalMessage: original, isImage: isImg };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('scamshield_history', JSON.stringify(updated));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setMessageText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!messageText.trim() && !imagePreview) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      let content = messageText;
      let isImg = false;
      if (imagePreview) {
        content = imagePreview.split(',')[1];
        isImg = true;
      }
      const analysis = await analyzeMessage(content, isImg, lang);
      setResult(analysis);
      saveToHistory(analysis, isImg ? "[Audit Image]" : messageText, isImg);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReport = () => {
    window.open('https://www.cybercrime.gov.in/', '_blank');
  };

  const t = {
    en: {
      title: "ScamShield Pro",
      subtitle: "Enterprise-grade AI fraud detection for the Indian digital ecosystem.",
      placeholder: "Paste SMS, WhatsApp, Email or upload screenshot...",
      analyze: "Analyze with DeepScan AI",
      analyzing: "Scanning Indicators...",
      history: "Recent Audits",
      trending: "Scam Radar (Live)",
      upload: "Audit Screenshot",
      report: "Report to Cyber Cell",
      helpline: "National Helpline: 112",
      statusBadge: "LIVE AUDIT ACTIVE"
    },
    hi: {
      title: "ScamShield प्रो",
      subtitle: "भारतीय डिजिटल पारिस्थितिकी तंत्र के लिए दुनिया का सबसे उन्नत AI धोखाधड़ी पता लगाना।",
      placeholder: "SMS, WhatsApp, ईमेल पेस्ट करें या स्क्रीनशॉट अपलोड करें...",
      analyze: "DeepScan AI से जांचें",
      analyzing: "संकेतों की जाँच...",
      history: "हालिया ऑडिट",
      trending: "स्कैम रडार (लाइव)",
      upload: "स्क्रीनशॉट ऑडिट",
      report: "साइबर सेल को रिपोर्ट करें",
      helpline: "राष्ट्रीय हेल्पलाइन: 112",
      statusBadge: "लाइव ऑडिट सक्रिय"
    }
  }[lang];

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 font-sans selection:bg-blue-100 pb-20 relative overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900">{t.title}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center bg-slate-50 border border-slate-100 rounded-full px-8 py-2.5 shadow-sm">
              <span className="text-[14px] font-black uppercase tracking-[0.08em] text-emerald-600">
                {t.statusBadge}
              </span>
            </div>
            
            <div className="bg-slate-100 p-1 rounded-full flex border border-slate-200">
              <button onClick={() => setLang('en')} className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>EN</button>
              <button onClick={() => setLang('hi')} className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${lang === 'hi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>HI</button>
            </div>
            <button onClick={() => setShowHistory(true)} className="p-2 text-slate-500 hover:text-blue-600 transition-all relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {history.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-16 relative z-10">
        <header className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 text-slate-900 leading-tight">
            Advanced Fraud <br/>Audit System.
          </h2>
          <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">{t.subtitle}</p>
        </header>

        {/* Audit Core Section */}
        <div className="mb-12">
          <div className="bg-white border border-[#dee2e6] rounded-[24px] p-0 shadow-sm overflow-hidden relative">
            {imagePreview ? (
              <div className="relative w-full aspect-video p-8 rounded-2xl bg-slate-50">
                <img src={imagePreview} className="w-full h-full object-contain" alt="Audit Target" />
                <button onClick={() => setImagePreview(null)} className="absolute top-12 right-12 bg-red-600 p-3 rounded-full shadow-xl hover:scale-110 transition-transform text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ) : (
              <textarea
                rows={8}
                className="w-full p-10 bg-white focus:outline-none text-slate-900 text-[22px] font-medium placeholder:text-slate-300 resize-none"
                placeholder={t.placeholder}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            )}
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="h-[64px] flex items-center justify-center gap-3 px-8 bg-white border border-[#dee2e6] rounded-[18px] text-[#495057] font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {t.upload}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              
              <div className="flex gap-2">
                {SAMPLE_MESSAGES.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => {setMessageText(s.text); setImagePreview(null);}} 
                    className="h-[64px] px-6 bg-[#ecf0f5] hover:bg-[#e2e8f0] text-[12px] font-black uppercase tracking-widest text-[#4a5568] rounded-[18px] transition-all border border-[#dee2e6]"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!messageText.trim() && !imagePreview)}
              className={`h-[110px] w-full md:w-[350px] rounded-[24px] font-bold text-white text-[18px] transition-all active:scale-95 shadow-xl ${
                isAnalyzing || (!messageText.trim() && !imagePreview)
                  ? 'bg-[#cbd5e0] cursor-not-allowed shadow-none'
                  : 'bg-[#ced4da] hover:bg-[#adb5bd] text-[#495057] shadow-[#0000000d]'
              } relative overflow-hidden flex items-center justify-center gap-4`}
              style={{
                background: (!isAnalyzing && (messageText.trim() || imagePreview)) ? 'linear-gradient(135deg, #d8e2ed 0%, #c9d6e5 100%)' : undefined
              }}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                  <span className="text-[#495057]">{t.analyzing}</span>
                </>
              ) : (
                <>
                  <svg className="text-[#adb5bd]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <span className="text-[#495057]">{t.analyze}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Status</p>
             <p className={`text-3xl font-black text-emerald-600`}>ACTIVE</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Audit Core</p>
             <p className={`text-3xl font-black text-slate-900 uppercase`}>Gemini AI</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">National Helpline</p>
             <p className={`text-3xl font-black text-red-500`}>112</p>
          </div>
        </section>

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <RiskBadge level={result.riskLevel} confidence={result.confidence} />
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-slate-200 p-8 rounded-3xl h-full flex flex-col justify-center shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      {result.category}
                    </span>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">DeepScan Verdict</span>
                  </div>
                  <p className="text-slate-900 font-bold text-3xl leading-tight">
                    {result.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-8 border-b border-slate-100 pb-4 flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Risk Indicators Found
                </h3>
                <ul className="space-y-6">
                  {result.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex gap-5 items-start">
                      <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black flex-shrink-0 text-xs">!</span>
                      <span className="text-slate-700 font-bold text-lg leading-snug">{flag}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-12 pt-8 border-t border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tactical Analysis</p>
                   <div className="flex flex-wrap gap-2">
                     {result.psychologicalTactics.map((t, i) => (
                       <span key={i} className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600">{t}</span>
                     ))}
                   </div>
                </div>
              </div>

              <div className="bg-blue-600 p-10 rounded-3xl text-white shadow-xl shadow-blue-200 flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-100 mb-8 border-b border-white/20 pb-4">Safe Response Protocol</h3>
                <ol className="space-y-8 flex-grow">
                  {result.recommendedActions.map((step, idx) => (
                    <li key={idx} className="flex gap-5 items-start">
                      <span className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-lg font-black">{idx + 1}</span>
                      <span className="font-bold text-xl leading-tight">{step}</span>
                    </li>
                  ))}
                </ol>
                <button onClick={handleReport} className="mt-12 w-full py-5 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  {t.report}
                </button>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 p-10 rounded-3xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-600 mb-8">Strictly Prohibited Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.doNotDo.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 bg-white border border-red-100 rounded-2xl">
                    <span className="text-2xl font-black text-red-500">×</span>
                    <span className="text-lg font-bold text-red-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {result.safeReply && (
              <section className="bg-white border-2 border-emerald-500 p-10 rounded-3xl shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6">
                  💬 Suggested Safe Reply
                </h3>
                <div className="bg-slate-50 p-6 border border-slate-200 rounded-2xl mb-8 text-slate-800 font-medium text-xl leading-relaxed italic">
                  "{result.safeReply}"
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.safeReply!);
                      alert('Copied to clipboard.');
                    }}
                    className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy reply
                  </button>
                  <p className="text-xs text-slate-500 font-medium italic">
                    Note: Only respond if you have verified the source via official channels.
                  </p>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* History Side Panel */}
      {showHistory && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" onClick={() => setShowHistory(false)}></div>
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-[110] p-10 animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-3xl font-black tracking-tight text-slate-900">{t.history}</h3>
              <button onClick={() => setShowHistory(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {history.length === 0 ? (
                <div className="text-center py-40 opacity-30">
                  <svg className="mx-auto mb-6" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p className="font-black text-xl uppercase tracking-widest text-slate-400">No Audits Performed</p>
                </div>
              ) : (
                history.map((item, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-500/50 transition-all cursor-pointer group" onClick={() => {setResult(item); setShowHistory(false);}}>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.riskLevel === RiskLevel.HIGH ? 'bg-red-100 text-red-600 border border-red-200' :
                        item.riskLevel === RiskLevel.MEDIUM ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                      }`}>
                        {item.riskLevel} Risk
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(item.timestamp!).toLocaleDateString()}</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{item.summary}</p>
                    <p className="text-sm text-slate-500 line-clamp-2">{item.originalMessage}</p>
                    <div className="mt-4 flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                       View Audit Report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                    </div>
                  </div>
                ))
              )}
            </div>
            {history.length > 0 && (
              <button 
                onClick={() => {setHistory([]); localStorage.removeItem('scamshield_history');}}
                className="w-full mt-10 py-4 text-red-600 font-black text-xs uppercase tracking-widest border-2 border-red-50 hover:bg-red-50 rounded-2xl transition-all"
              >
                Clear Local Audit History
              </button>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="mt-40 border-t border-slate-200 py-20 text-center relative z-10 bg-white">
        <div className="max-w-xl mx-auto px-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-50 border border-red-100 rounded-full text-red-600 font-black text-sm uppercase tracking-[0.2em] mb-8">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            {t.helpline}
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
            ScamShield Pro is an AI-driven fraud diagnostic tool. All analysis is local to this session and performed using Google Gemini technology.
          </p>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest opacity-60">
            For educational guidance only • Not official law enforcement advice
          </p>
          <div className="mt-12 flex justify-center gap-8 grayscale opacity-20 font-black text-[10px] tracking-widest uppercase text-slate-900">
            <span>Audit Engine v4.1</span>
            <span>Indian Digital Security Standard</span>
            <span>Privacy First Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

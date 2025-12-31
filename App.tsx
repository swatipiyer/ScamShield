
import React, { useState, useRef, useEffect } from 'react';
import { analyzeMessage } from './geminiService';
import { AnalysisResult, RiskLevel, Language } from './types';
import { SAMPLE_MESSAGES } from './constants';
import RiskBadge from './components/RiskBadge';

const App: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TRENDING_SCAMS = [
    "⚠️ ALERT: Digital Arrest scams reported via Skype calls.",
    "📦 TRENDING: Fake FedEx/BlueDart courier 'Customs' calls.",
    "🏦 WARNING: Electricity bill 'disconnection' SMS fraud.",
    "📱 WATCH: Fake 'Work from Home' YouTube like-job scams."
  ];

  useEffect(() => {
    const saved = localStorage.getItem('scamshield_history');
    if (saved) setHistory(JSON.parse(saved));

    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % TRENDING_SCAMS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveToHistory = (res: AnalysisResult, original: string, isImg: boolean) => {
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

  const handleShare = () => {
    if (!result) return;
    const text = `🚨 Scam Alert! I used ScamShield to check a message. 
Result: ${result.riskLevel} Risk (${result.category})
Summary: ${result.summary}
Be safe! Use ScamShield.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Fix: Added handleReport function to resolve the missing reference error
  const handleReport = () => {
    window.open('https://www.cybercrime.gov.in/', '_blank');
  };

  const t = {
    en: {
      title: "ScamShield Pro",
      subtitle: "AI-powered fraud diagnostics for the modern Indian user.",
      placeholder: "Paste SMS, WhatsApp, Email or upload screenshot...",
      analyze: "Analyze with DeepScan AI",
      analyzing: "Scanning Indicators...",
      history: "Recent Audits",
      upload: "Audit Screenshot",
      report: "Report to Cyber Cell",
      helpline: "National Helpline: 112",
      share: "Share Alert with Family",
      statusBadge: "LIVE PROTECTION"
    },
    hi: {
      title: "ScamShield प्रो",
      subtitle: "भारतीय उपयोगकर्ताओं के लिए AI-संचालित धोखाधड़ी निदान।",
      placeholder: "SMS, WhatsApp, ईमेल पेस्ट करें या स्क्रीनशॉट अपलोड करें...",
      analyze: "DeepScan AI से जांचें",
      analyzing: "संकेतों की जाँच...",
      history: "हालिया ऑडिट",
      upload: "स्क्रीनशॉट ऑडिट",
      report: "साइबर सेल को रिपोर्ट करें",
      helpline: "राष्ट्रीय हेल्पलाइन: 112",
      share: "परिवार के साथ साझा करें",
      statusBadge: "लाइव सुरक्षा"
    }
  }[lang];

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-slate-900 font-sans selection:bg-blue-100 pb-20 relative">
      {/* Trending Ticker */}
      <div className="bg-blue-900 text-white py-2 px-4 overflow-hidden whitespace-nowrap">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <span className="bg-red-500 text-[10px] font-black px-2 py-0.5 rounded uppercase">Latest</span>
          <p className="text-sm font-bold animate-pulse transition-opacity duration-500">
            {TRENDING_SCAMS[tickerIndex]}
          </p>
        </div>
      </div>

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-md">
              <svg className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900">{t.title}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {t.statusBadge}
              </span>
            </div>
            <div className="bg-slate-100 p-1 rounded-full flex">
              <button onClick={() => setLang('en')} className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>EN</button>
              <button onClick={() => setLang('hi')} className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${lang === 'hi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>HI</button>
            </div>
            <button onClick={() => setShowHistory(true)} className="p-2 text-slate-500 hover:text-blue-600 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <header className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-slate-900 leading-tight">
                Instantly Detect <br/>Fraudulent Content.
              </h1>
              <p className="text-slate-500 text-lg font-medium max-w-xl">{t.subtitle}</p>
            </header>

            <div className="bg-white border border-slate-200 rounded-[32px] p-2 shadow-xl shadow-slate-200/50 mb-10 overflow-hidden">
               <div className="p-6">
                 {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden">
                    <img src={imagePreview} className="w-full h-full object-contain" alt="Audit Target" />
                    <button onClick={() => setImagePreview(null)} className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg text-red-600 hover:scale-110 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ) : (
                  <textarea
                    rows={6}
                    className="w-full p-4 bg-transparent focus:outline-none text-slate-900 text-xl font-medium placeholder:text-slate-300 resize-none"
                    placeholder={t.placeholder}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                )}
               </div>
               
               <div className="bg-slate-50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all shadow-sm"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      {t.upload}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                 </div>

                 <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!messageText.trim() && !imagePreview)}
                    className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-white text-base transition-all shadow-lg active:scale-95 ${
                      isAnalyzing || (!messageText.trim() && !imagePreview)
                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200/50'
                    }`}
                  >
                    {isAnalyzing ? t.analyzing : t.analyze}
                  </button>
               </div>
            </div>

            {/* Samples Section */}
            <div className="flex flex-wrap gap-2 mb-12">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-full mb-1">Try a common scenario</span>
               {SAMPLE_MESSAGES.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => {setMessageText(s.text); setImagePreview(null);}} 
                  className="px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Results Area */}
            {result && (
              <div ref={resultsRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RiskBadge level={result.riskLevel} confidence={result.confidence} />
                  <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">{result.category}</span>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight mb-4">{result.summary}</h2>
                    <button 
                      onClick={handleShare}
                      className="mt-auto w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                      {t.share}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white border border-slate-200 p-8 rounded-3xl">
                      <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-6 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        Red Flags Identified
                      </h3>
                      <ul className="space-y-4">
                        {result.redFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-red-500 font-bold mt-1">•</span>
                            <span className="text-slate-700 font-bold">{flag}</span>
                          </li>
                        ))}
                      </ul>
                   </div>
                   <div className="bg-blue-600 p-8 rounded-3xl text-white">
                      <h3 className="text-xs font-black uppercase tracking-widest text-blue-100 mb-6">Immediate Protocol</h3>
                      <ul className="space-y-4">
                        {result.recommendedActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-black text-[10px] mt-0.5">{i+1}</span>
                            <span className="font-bold">{action}</span>
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>

                <div className="bg-red-50 border border-red-100 p-8 rounded-3xl">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-6">Strictly Prohibited</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.doNotDo.map((item, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-red-100 flex items-center gap-3">
                          <span className="text-red-500 font-black">×</span>
                          <span className="text-sm font-bold text-red-900">{item}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex justify-center">
                   <button onClick={handleReport} className="text-blue-600 font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:underline">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      {t.report}
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area: Safety Checklist */}
          <div className="lg:col-span-4">
             <div className="sticky top-32 space-y-6">
                <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                   <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                     <svg className="text-blue-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                     Safety Checklist
                   </h3>
                   <div className="space-y-4">
                      {[
                        "Never share OTP or Bank PIN.",
                        "KYC is never done via SMS links.",
                        "Check for official '@domain' in emails.",
                        "Government never asks for 'Digital Arrest' via Video call.",
                        "Verify suspicious numbers on 112."
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer group hover:bg-slate-100 transition-colors">
                          <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{item}</span>
                        </label>
                      ))}
                   </div>
                </div>

                <div className="bg-red-600 p-8 rounded-3xl text-white shadow-lg shadow-red-200">
                   <span className="text-[10px] font-black uppercase tracking-widest text-red-200">Emergency</span>
                   <p className="text-2xl font-black mb-4">Financial Fraud?</p>
                   <p className="text-sm font-bold text-red-100 mb-6">Call the National Cyber Crime Helpline immediately within the 'Golden Hour'.</p>
                   <a href="tel:112" className="block w-full py-4 bg-white text-red-600 rounded-2xl text-center font-black text-xl shadow-md active:scale-95 transition-all">
                     Call 112
                   </a>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* History Slide Panel */}
      {showHistory && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" onClick={() => setShowHistory(false)}></div>
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[110] p-8 animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-900">{t.history}</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 bg-slate-100 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              {history.map((item, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-500 transition-all" onClick={() => {setResult(item); setShowHistory(false);}}>
                   <div className="flex justify-between items-center mb-2">
                     <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        item.riskLevel === RiskLevel.HIGH ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                     }`}>{item.riskLevel}</span>
                     <span className="text-[10px] text-slate-400 font-bold">{new Date(item.timestamp!).toLocaleDateString()}</span>
                   </div>
                   <p className="font-bold text-slate-900 text-sm line-clamp-1">{item.summary}</p>
                </div>
              ))}
              {history.length === 0 && <p className="text-center text-slate-400 py-20 font-bold">No recent checks found.</p>}
            </div>
          </div>
        </>
      )}

      <footer className="mt-40 border-t border-slate-200 py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
           <p className="text-slate-400 text-sm font-bold mb-4">Educational Diagnostic System for Indian Digital Citizens.</p>
           <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Local Privacy Guaranteed • Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

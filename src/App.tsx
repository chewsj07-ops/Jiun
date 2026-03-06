import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Heart, History, MessageCircle, Settings, Trophy, Sparkles, Loader2, Music, Play, Pause, Volume2, Wind } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { WoodenFish } from './components/WoodenFish';
import { ZenAssistant } from './components/ZenAssistant';
import { Meditation } from './components/Meditation';
import { LiveMeditation } from './components/LiveMeditation';
import { SCRIPTURES, Scripture } from './constants';
import { cn } from './lib/utils';

export default function App() {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('zen_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [activeTab, setActiveTab] = useState<'fish' | 'scripture' | 'assistant' | 'history' | 'meditation' | 'live'>('fish');
  const [selectedScripture, setSelectedScripture] = useState<Scripture>(SCRIPTURES[0]);
  const [selectedChant, setSelectedChant] = useState<string>(() => {
    return localStorage.getItem('zen_selected_chant') || "功德 +1";
  });

  // Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('zen_onboarding_seen');
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [sessionFlowStep, setSessionFlowStep] = useState<'none' | 'dedication' | 'vow' | 'summary'>('none');
  const [lastSession, setLastSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('zen_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('zen_count', count.toString());
  }, [count]);

  useEffect(() => {
    localStorage.setItem('zen_selected_chant', selectedChant);
  }, [selectedChant]);

  useEffect(() => {
    localStorage.setItem('zen_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);

  const handleHit = () => {
    setCount(prev => prev + 1);
    if (isSessionActive) {
      setSessionCount(prev => prev + 1);
    }
  };

  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [currentReflection, setCurrentReflection] = useState("");

  const startSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setSessionCount(0);
    setCurrentReflection("");
  };

  const finishSession = async () => {
    const endTime = Date.now();
    const duration = Math.floor((endTime - (sessionStartTime || endTime)) / 1000);
    
    const newSession = {
      id: Date.now(),
      chant: selectedChant,
      count: sessionCount,
      startTime: sessionStartTime,
      endTime,
      duration,
    };

    setHistory(prev => [newSession, ...prev]);
    setLastSession(newSession);
    setIsSessionActive(false);
    setSessionFlowStep('dedication');
    setShowSummary(true);

    // Generate AI Reflection
    setIsGeneratingReflection(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `我刚刚完成了一次修行。念诵内容是：${selectedChant}，念诵次数：${sessionCount}次，时长：${Math.floor(duration / 60)}分${duration % 60}秒。请作为禅师给我一段简短的、充满智慧的“回想”或感悟，字数在50字以内。`,
      });
      setCurrentReflection(response.text || "心如止水，功德圆满。");
    } catch (error) {
      console.error("AI Reflection Error:", error);
      setCurrentReflection("修行不在于数量，而在于那一刻的清净心。愿此功德，普及于一切。");
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const buddhaNames = SCRIPTURES.filter(s => s.category === 'name');

  const finishOnboarding = () => {
    localStorage.setItem('zen_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const onboardingSteps = [
    {
      title: "欢迎来到念经助手",
      description: "在这里，您可以放下尘嚣，开启一段宁静的数字修行之旅。",
      icon: Heart,
      color: "bg-zen-accent/10 text-zen-accent"
    },
    {
      title: "电子木鱼 · 积攒功德",
      description: "点击木鱼，伴随清脆声响积攒功德。您可以自由选择佛号，系统将为您记录每一次至诚念诵。",
      icon: Heart,
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "经典经文 · 深入经藏",
      description: "内置多种经典经文、神咒与佛号。支持分类浏览与沉浸式阅读，助您深入佛法智慧。",
      icon: Book,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "禅修引导 · 寻找宁静",
      description: "提供多种禅修氛围音乐与呼吸引导。在喧嚣中寻找片刻宁静，让心灵回归本真。",
      icon: Wind,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "AI 禅师 · 智慧指引",
      description: "修行结束后，AI 禅师将根据您的修行情况生成专属感悟，为您提供心灵的指引与回想。",
      icon: MessageCircle,
      color: "bg-blue-100 text-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-zen-bg text-zen-ink selection:bg-zen-accent/20">
      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zen-bg/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl border border-zen-accent/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-zen-bg">
                <motion.div 
                  className="h-full bg-zen-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((onboardingStep + 1) / onboardingSteps.length) * 100}%` }}
                />
              </div>

              <div className="text-center">
                <motion.div
                  key={onboardingStep}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-colors duration-500",
                    onboardingSteps[onboardingStep].color
                  )}
                >
                  {React.createElement(onboardingSteps[onboardingStep].icon, { className: "w-10 h-10" })}
                </motion.div>

                <motion.h2 
                  key={`t-${onboardingStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-serif font-bold mb-4"
                >
                  {onboardingSteps[onboardingStep].title}
                </motion.h2>

                <motion.p 
                  key={`d-${onboardingStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-zen-accent/60 leading-relaxed mb-10 text-sm"
                >
                  {onboardingSteps[onboardingStep].description}
                </motion.p>
              </div>

              <div className="flex gap-3">
                {onboardingStep > 0 && (
                  <button
                    onClick={() => setOnboardingStep(prev => prev - 1)}
                    className="flex-1 py-4 rounded-2xl font-bold text-zen-accent/60 hover:bg-zen-bg transition-colors"
                  >
                    上一步
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onboardingStep < onboardingSteps.length - 1) {
                      setOnboardingStep(prev => prev + 1);
                    } else {
                      finishOnboarding();
                    }
                  }}
                  className="flex-[2] bg-zen-accent text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity"
                >
                  {onboardingStep === onboardingSteps.length - 1 ? "开启修行" : "下一步"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary / Dedication / Vow Modal */}
      <AnimatePresence>
        {showSummary && lastSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-zen-accent/10"
            >
              {sessionFlowStep === 'dedication' && (
                <motion.div key="dedication" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-zen-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-zen-accent" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold">至诚回向</h2>
                    <p className="text-xs text-zen-accent/40 uppercase tracking-widest font-bold mt-2">Dedication of Merit</p>
                  </div>
                  
                  <div className="bg-zen-bg/50 p-8 rounded-[32px] mb-8">
                    <p className="text-lg font-serif leading-relaxed text-center text-zen-ink/80 whitespace-pre-wrap">
                      愿以此功德，庄严佛净土。{"\n"}
                      上报四重恩，下济三途苦。{"\n"}
                      若有见闻者，悉发菩提心。{"\n"}
                      尽此一报身，同生极乐国。
                    </p>
                  </div>

                  <button 
                    onClick={() => setSessionFlowStep('vow')}
                    className="w-full bg-zen-accent text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    至诚回向
                  </button>
                </motion.div>
              )}

              {sessionFlowStep === 'vow' && (
                <motion.div key="vow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-zen-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-zen-accent" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold">至诚发愿</h2>
                    <p className="text-xs text-zen-accent/40 uppercase tracking-widest font-bold mt-2">The Four Great Vows</p>
                  </div>
                  
                  <div className="bg-zen-bg/50 p-8 rounded-[32px] mb-8">
                    <p className="text-lg font-serif leading-relaxed text-center text-zen-ink/80 whitespace-pre-wrap">
                      众生无边誓愿度，{"\n"}
                      烦恼无尽誓愿断，{"\n"}
                      法门无量誓愿学，{"\n"}
                      佛道无上誓愿成。
                    </p>
                  </div>

                  <button 
                    onClick={() => setSessionFlowStep('summary')}
                    className="w-full bg-zen-accent text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity"
                  >
                    至诚发愿
                  </button>
                </motion.div>
              )}

              {sessionFlowStep === 'summary' && (
                <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-zen-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-zen-accent" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold">修行圆满</h2>
                    <p className="text-sm text-zen-accent/60 italic mt-1">“心无挂碍，无挂碍故”</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-3 border-b border-zen-accent/5">
                      <span className="text-sm text-zen-accent/60">念诵内容</span>
                      <span className="font-medium">{lastSession.chant}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-zen-accent/5">
                      <span className="text-sm text-zen-accent/60">本次功德</span>
                      <span className="font-serif text-xl">+{lastSession.count}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-zen-accent/5">
                      <span className="text-sm text-zen-accent/60">修行时长</span>
                      <span className="font-medium">{Math.floor(lastSession.duration / 60)}分{lastSession.duration % 60}秒</span>
                    </div>
                  </div>

                  <div className="bg-zen-bg/50 p-5 rounded-3xl mb-8 relative">
                    <div className="absolute -top-2 -left-2 bg-zen-accent text-white p-1 rounded-lg">
                      <MessageCircle className="w-3 h-3" />
                    </div>
                    {isGeneratingReflection ? (
                      <div className="flex flex-col items-center py-4 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-zen-accent/40" />
                        <p className="text-[10px] text-zen-accent/40 uppercase tracking-widest">禅师感悟中...</p>
                      </div>
                    ) : (
                      <p className="italic text-sm text-center text-zen-ink/80 leading-relaxed">
                        “{currentReflection || "修行不在于数量，而在于那一刻的清净心。愿此功德，普及于一切。"}”
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      setShowSummary(false);
                      setSessionFlowStep('none');
                    }}
                    className="w-full bg-zen-accent text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity"
                  >
                    随喜赞叹
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zen-accent flex items-center justify-center text-white">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">念经助手</h1>
            <p className="text-xs text-zen-accent/60 uppercase tracking-widest font-medium">Digital Zen Space</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-zen-accent/50 font-bold">累计功德</p>
            <p className="text-2xl font-serif font-semibold tabular-nums">{count.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        {/* Navigation Tabs */}
        <nav className="flex gap-1 mb-12 bg-white/50 p-1 rounded-2xl border border-zen-accent/5 w-fit mx-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'fish', icon: Heart, label: '木鱼' },
            { id: 'scripture', icon: Book, label: '经文' },
            { id: 'meditation', icon: Wind, label: '禅修' },
            { id: 'live', icon: Sparkles, label: '语音引导' },
            { id: 'assistant', icon: MessageCircle, label: '禅师' },
            { id: 'history', icon: History, label: '功德簿' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-white text-zen-accent shadow-sm" 
                  : "text-zen-accent/40 hover:text-zen-accent/60"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'fish' && (
            <motion.div
              key="fish"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <WoodenFish onHit={handleHit} floatingText={selectedChant} className="mb-12" />
              
              <div className="w-full max-w-md space-y-8">
                {/* Session Control */}
                <div className="flex justify-center">
                  {!isSessionActive ? (
                    <button 
                      onClick={startSession}
                      className="bg-zen-accent text-white px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      开始修行
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-8 bg-white px-8 py-4 rounded-full border border-zen-accent/10 shadow-sm">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest text-zen-accent/40 font-bold">本次功德</p>
                          <p className="text-2xl font-serif font-bold text-zen-accent">{sessionCount}</p>
                        </div>
                        <div className="w-px h-8 bg-zen-accent/10" />
                        <button 
                          onClick={finishSession}
                          className="text-zen-accent font-bold hover:opacity-70 transition-opacity"
                        >
                          圆满结束
                        </button>
                      </div>
                      <p className="text-xs text-zen-accent/40 animate-pulse italic">修行中，心无旁骛...</p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-zen-accent/5 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-zen-accent/50 font-bold mb-4 text-center">选择佛号</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setSelectedChant("功德 +1")}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-medium transition-all border",
                        selectedChant === "功德 +1"
                          ? "bg-zen-accent text-white border-zen-accent"
                          : "bg-white text-zen-accent border-zen-accent/10 hover:border-zen-accent/30"
                      )}
                    >
                      功德 +1
                    </button>
                    {buddhaNames.map(name => (
                      <button
                        key={name.id}
                        onClick={() => setSelectedChant(name.title)}
                        className={cn(
                          "px-4 py-2 rounded-full text-xs font-medium transition-all border",
                          selectedChant === name.title
                            ? "bg-zen-accent text-white border-zen-accent"
                            : "bg-white text-zen-accent border-zen-accent/10 hover:border-zen-accent/30"
                        )}
                      >
                        {name.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-zen-accent/5 shadow-sm">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zen-accent/50 font-bold">功德进度</p>
                      <p className="text-sm font-serif mt-1">{count} / 1000</p>
                    </div>
                    <p className="text-xs font-bold text-zen-accent">{Math.round(Math.min(100, (count / 1000) * 100))}%</p>
                  </div>
                  <div className="h-3 w-full bg-zen-bg rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (count / 1000) * 100)}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      className="h-full bg-zen-accent rounded-full shadow-[0_0_10px_rgba(139,94,60,0.3)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    key={count}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.2 }}
                    className="bg-white p-6 rounded-3xl border border-zen-accent/5 shadow-sm"
                  >
                    <Trophy className="w-5 h-5 text-zen-accent/40 mb-2" />
                    <p className="text-xs text-zen-accent/50 uppercase tracking-wider font-bold">今日目标</p>
                    <p className="text-xl font-serif">{count} / 1000</p>
                  </motion.div>
                  <div className="bg-white p-6 rounded-3xl border border-zen-accent/5 shadow-sm">
                    <History className="w-5 h-5 text-zen-accent/40 mb-2" />
                    <p className="text-xs text-zen-accent/50 uppercase tracking-wider font-bold">连续修行</p>
                    <p className="text-xl font-serif">7 天</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'meditation' && (
            <motion.div
              key="meditation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <Meditation />
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <LiveMeditation />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto w-full"
            >
              <div className="bg-white rounded-[40px] p-8 shadow-sm border border-zen-accent/5">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold">功德簿</h2>
                  <div className="text-xs text-zen-accent/40 uppercase tracking-widest font-bold">修行记录</div>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-20 text-zen-accent/30 italic">
                    暂无修行记录，开始您的第一次修行吧。
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="p-4 rounded-2xl bg-zen-bg/30 border border-zen-accent/5 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.chant}</p>
                          <p className="text-[10px] text-zen-accent/40 mt-1">
                            {new Date(item.endTime).toLocaleString()} · {Math.floor(item.duration / 60)}分{item.duration % 60}秒
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-lg text-zen-accent">+{item.count}</p>
                          <p className="text-[10px] text-zen-accent/40 uppercase tracking-widest font-bold">功德</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'scripture' && (
            <motion.div
              key="scripture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-1 space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zen-accent/50 font-bold mb-3 px-2">经典经文</p>
                  <div className="space-y-1">
                    {SCRIPTURES.filter(s => s.category === 'sutra').map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedScripture(s)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-2xl text-sm transition-all",
                          selectedScripture.id === s.id
                            ? "bg-zen-accent text-white shadow-md"
                            : "bg-white/50 text-zen-accent/70 hover:bg-white"
                        )}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zen-accent/50 font-bold mb-3 px-2">神咒真言</p>
                  <div className="space-y-1">
                    {SCRIPTURES.filter(s => s.category === 'mantra').map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedScripture(s)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-2xl text-sm transition-all",
                          selectedScripture.id === s.id
                            ? "bg-zen-accent text-white shadow-md"
                            : "bg-white/50 text-zen-accent/70 hover:bg-white"
                        )}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zen-accent/50 font-bold mb-3 px-2">佛号圣号</p>
                  <div className="space-y-1">
                    {SCRIPTURES.filter(s => s.category === 'name').map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedScripture(s)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-2xl text-sm transition-all",
                          selectedScripture.id === s.id
                            ? "bg-zen-accent text-white shadow-md"
                            : "bg-white/50 text-zen-accent/70 hover:bg-white"
                        )}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-zen-accent/5 min-h-[500px] flex flex-col">
                <h2 className="text-2xl font-serif font-bold mb-8 text-center border-b border-zen-accent/10 pb-6">
                  {selectedScripture.title}
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="prose prose-stone max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-lg text-zen-ink/80 font-serif text-center">
                      {selectedScripture.content}
                    </p>
                  </div>
                </div>
                <div className="mt-12 flex justify-center">
                  <div className="w-12 h-1 bg-zen-accent/10 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto w-full"
            >
              <ZenAssistant />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 w-full p-6 pointer-events-none overflow-hidden h-32">
        <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-zen-accent/5 blur-[100px] rounded-full" />
      </footer>
    </div>
  );
}

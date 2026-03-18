import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { practiceService } from '../services/practiceService';

export const RejoicingPage: React.FC = () => {
  const [stats, setStats] = useState(practiceService.getRejoiceStats());

  const handleRejoice = () => {
    practiceService.logRejoice();
    setStats(practiceService.getRejoiceStats());
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-zen-accent/5 shadow-sm">
        <h2 className="text-xl font-bold mb-4">随喜赞叹</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-zen-bg rounded-2xl">
            <p className="text-xs text-zen-accent/50">今日</p>
            <p className="text-2xl font-bold">{stats.today}</p>
          </div>
          <div className="text-center p-3 bg-zen-bg rounded-2xl">
            <p className="text-xs text-zen-accent/50">本周</p>
            <p className="text-2xl font-bold">{stats.week}</p>
          </div>
          <div className="text-center p-3 bg-zen-bg rounded-2xl">
            <p className="text-xs text-zen-accent/50">总计</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
        <button
          onClick={handleRejoice}
          className="w-full py-4 bg-zen-accent text-white rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Heart className="w-5 h-5" />
          随喜赞叹
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zen-accent/5 shadow-sm">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-zen-accent" />
          为什么随喜赞叹？
        </h3>
        <p className="text-sm text-zen-ink/80 leading-relaxed">
          随喜赞叹是修行的方便法门，通过真诚地赞叹他人的善行，我们能破除内心的嫉妒与傲慢，培养随顺众生、广结善缘的慈悲心。赞叹他人的功德，如同在自己的心地中播下善种，不仅能让对方感到温暖，也能让自己的内心变得更加宽广、柔软，从而转苦为乐，福慧双修。
        </p>
      </div>
    </div>
  );
};

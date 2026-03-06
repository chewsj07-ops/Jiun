import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Howl } from 'howler';
import { cn } from '../lib/utils';

interface WoodenFishProps {
  onHit: () => void;
  className?: string;
  floatingText?: string;
}

export const WoodenFish: React.FC<WoodenFishProps> = ({ onHit, className, floatingText = "功德 +1" }) => {
  const [isHitting, setIsHitting] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number }[]>([]);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    soundRef.current = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3'], // Placeholder for wooden fish sound
      volume: 0.5,
    });
    return () => {
      soundRef.current?.unload();
    };
  }, []);

  const handleHit = () => {
    setIsHitting(true);
    soundRef.current?.play();
    onHit();

    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x: Math.random() * 40 - 20, y: -20 }]);
    
    setTimeout(() => {
      setIsHitting(false);
    }, 100);

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  return (
    <div className={cn("relative flex flex-col items-center justify-center cursor-pointer select-none", className)} onClick={handleHit}>
      <AnimatePresence>
        {floatingTexts.map(text => (
          <motion.div
            key={text.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -100, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="absolute text-zen-accent font-medium pointer-events-none whitespace-nowrap"
            style={{ left: `calc(50% + ${text.x}px)` }}
          >
            {floatingText}
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        animate={isHitting ? { scale: 0.92, y: 4 } : { scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 12 }}
        className="relative"
      >
        {/* Softer, more attractive Wooden Fish design */}
        <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="wooden-fish-glow drop-shadow-xl">
          <defs>
            <radialGradient id="fishGradient" cx="50%" cy="40%" r="60%" fx="50%" fy="30%">
              <stop offset="0%" stopColor="#A67B5B" />
              <stop offset="100%" stopColor="#5C4033" />
            </radialGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="4" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Main Body - Rounder and softer */}
          <path 
            d="M190 90C190 130 155 155 110 155C65 155 30 130 30 90C30 50 65 25 110 25C155 25 190 50 190 90Z" 
            fill="url(#fishGradient)" 
          />
          
          {/* Inner highlight for depth */}
          <path 
            d="M170 85C170 115 145 135 110 135C75 135 50 115 50 85C50 55 75 35 110 35C145 35 170 55 170 85Z" 
            fill="white" 
            fillOpacity="0.1" 
          />
          
          {/* The "Smile" Slit - Curved and friendly */}
          <path 
            d="M60 95C80 105 140 105 160 95" 
            stroke="#3D2B1F" 
            strokeWidth="6" 
            strokeLinecap="round" 
            opacity="0.8"
          />
          
          {/* Gentle Eye */}
          <circle cx="155" cy="70" r="4" fill="#3D2B1F" opacity="0.6" />
          
          {/* Base/Stand - Softer rectangle */}
          <rect x="85" y="145" width="50" height="12" rx="6" fill="#3D2B1F" opacity="0.4" />
          
          {/* Decorative pattern (Zen circles) */}
          <circle cx="110" cy="90" r="40" stroke="white" strokeWidth="1" strokeDasharray="4 8" opacity="0.1" />
        </svg>
      </motion.div>
      
      <p className="mt-4 text-sm text-zen-accent/60 italic">点击木鱼，积攒功德</p>
    </div>
  );
};

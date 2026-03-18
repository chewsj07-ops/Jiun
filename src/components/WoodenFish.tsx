import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Howl } from 'howler';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';

interface WoodenFishProps {
  onHit: () => void;
  className?: string;
  floatingText?: string;
  volume?: number;
  soundType?: 'standard' | 'crisp' | 'deep';
  appearance?: 'fish' | 'lotus' | 'bowl';
  disabled?: boolean;
  disabledMessage?: string;
}

export const WoodenFish: React.FC<WoodenFishProps> = ({ 
  onHit, 
  className, 
  floatingText = "功德 +1", 
  volume = 0.8, 
  soundType = 'standard',
  appearance = 'fish',
  disabled = false,
  disabledMessage = "请先开始诵经"
}) => {
  const { t } = useTranslation();
  const [isHitting, setIsHitting] = useState(false);
  const [showDisabledMsg, setShowDisabledMsg] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; isCombo?: boolean; comboCount?: number }[]>([]);
  const soundRef = useRef<Howl | null>(null);
  
  // Combo system state
  const lastHitTimeRef = useRef<number>(0);
  const comboCountRef = useRef<number>(0);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let rate = 1.0;
    if (soundType === 'crisp') rate = 1.3;
    if (soundType === 'deep') rate = 0.7;
    // Adjust rate slightly for different instruments if needed
    if (appearance === 'bowl') rate *= 0.8; 

    soundRef.current = new Howl({
      src: [
        appearance === 'bowl' 
          ? 'https://actions.google.com/sounds/v1/foley/bell_small.ogg' // Singing bowl sound
          : 'https://actions.google.com/sounds/v1/foley/wood_block_hit.ogg' // Wooden fish / Lotus sound
      ],
      volume: volume,
      rate: rate,
    });
    return () => {
      soundRef.current?.unload();
    };
  }, [soundType, appearance]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  const handleHit = () => {
    if (disabled) {
      setShowDisabledMsg(true);
      setTimeout(() => setShowDisabledMsg(false), 2000);
      return;
    }

    setIsHitting(true);
    
    const now = Date.now();
    const timeSinceLastHit = now - lastHitTimeRef.current;
    
    // Combo logic: if hit within 400ms, increase combo
    if (timeSinceLastHit < 400) {
      comboCountRef.current += 1;
    } else {
      comboCountRef.current = 1;
    }
    lastHitTimeRef.current = now;

    // Clear previous combo timeout
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    
    // Reset combo after 1 second of inactivity
    comboTimeoutRef.current = setTimeout(() => {
      comboCountRef.current = 0;
    }, 1000);

    const isCombo = comboCountRef.current >= 3;
    
    // Play sound with dynamic rate/volume based on combo
    if (soundRef.current) {
      const baseRate = soundType === 'crisp' ? 1.3 : soundType === 'deep' ? 0.7 : 1.0;
      let currentRate = isCombo ? baseRate * 1.1 : baseRate;
      if (appearance === 'bowl') currentRate *= 0.8;

      const currentVolume = isCombo ? Math.min(volume * 1.2, 1.0) : volume;
      
      soundRef.current.rate(currentRate);
      soundRef.current.volume(currentVolume);
      soundRef.current.play();
    }
    
    // Add haptic feedback if supported
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(isCombo ? [30, 30, 30] : 50); // Stronger vibration for combo
    }
    
    onHit();

    const id = Date.now();
    setFloatingTexts(prev => [...prev, { 
      id, 
      x: Math.random() * 40 - 20, 
      y: -20,
      isCombo,
      comboCount: comboCountRef.current
    }]);
    
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
        {showDisabledMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-12 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-20 whitespace-nowrap"
          >
            {disabledMessage}
          </motion.div>
        )}
        {floatingTexts.map(text => (
          <motion.div
            key={text.id}
            initial={{ opacity: 1, y: 0, scale: text.isCombo ? 1.2 : 0.8 }}
            animate={{ opacity: 0, y: -60, scale: text.isCombo ? 1.5 : 1.2 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute font-medium pointer-events-none whitespace-nowrap z-10 text-sm sm:text-base max-w-[200px] text-center truncate",
              text.isCombo ? "text-amber-500 font-bold drop-shadow-md" : "text-zen-accent"
            )}
            style={{ left: `50%`, transform: `translateX(calc(-50% + ${text.x}px))`, top: `-20px` }}
          >
            {text.isCombo ? `${t('combo_x')}${text.comboCount} !` : floatingText}
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        animate={isHitting ? { scale: 0.95, y: 8 } : { scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 10 }}
        className="relative"
      >
        {appearance === 'fish' && (
          <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="wooden-fish-glow drop-shadow-xl text-zen-accent">
            <defs>
              <radialGradient id="fishGradient" cx="50%" cy="40%" r="60%" fx="50%" fy="30%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                <stop offset="100%" stopColor="currentColor" />
              </radialGradient>
            </defs>
            <path 
              d="M190 90C190 130 155 155 110 155C65 155 30 130 30 90C30 50 65 25 110 25C155 25 190 50 190 90Z" 
              fill="url(#fishGradient)" 
            />
            <path 
              d="M170 85C170 115 145 135 110 135C75 135 50 115 50 85C50 55 75 35 110 35C145 35 170 55 170 85Z" 
              fill="white" 
              fillOpacity="0.1" 
            />
            <path 
              d="M60 95C80 105 140 105 160 95" 
              stroke="rgba(0,0,0,0.3)" 
              strokeWidth="6" 
              strokeLinecap="round" 
              opacity="0.8"
            />
            <circle cx="155" cy="70" r="4" fill="rgba(0,0,0,0.3)" opacity="0.6" />
            <rect x="85" y="145" width="50" height="12" rx="6" fill="rgba(0,0,0,0.3)" opacity="0.4" />
            <circle cx="110" cy="90" r="40" stroke="white" strokeWidth="1" strokeDasharray="4 8" opacity="0.1" />
          </svg>
        )}

        {appearance === 'lotus' && (
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="wooden-fish-glow drop-shadow-xl text-zen-accent">
            <defs>
              <linearGradient id="lotusGradient" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                <stop offset="100%" stopColor="currentColor" />
              </linearGradient>
            </defs>
            {/* Lotus Petals */}
            <path d="M100 20 C100 20 140 60 140 100 C140 140 100 180 100 180 C100 180 60 140 60 100 C60 60 100 20 100 20 Z" fill="url(#lotusGradient)" />
            <path d="M100 180 C100 180 150 150 170 100 C190 50 100 40 100 40" fill="currentColor" fillOpacity="0.6" />
            <path d="M100 180 C100 180 50 150 30 100 C10 50 100 40 100 40" fill="currentColor" fillOpacity="0.6" />
            <path d="M60 100 C60 100 20 120 20 150 C20 180 100 190 100 190" fill="currentColor" fillOpacity="0.4" />
            <path d="M140 100 C140 100 180 120 180 150 C180 180 100 190 100 190" fill="currentColor" fillOpacity="0.4" />
            {/* Center */}
            <circle cx="100" cy="100" r="10" fill="#FFD700" fillOpacity="0.8" />
          </svg>
        )}

        {appearance === 'bowl' && (
          <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="wooden-fish-glow drop-shadow-xl text-zen-accent">
            <defs>
              <linearGradient id="bowlGradient" x1="100" y1="40" x2="100" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
                <stop offset="100%" stopColor="currentColor" />
              </linearGradient>
            </defs>
            {/* Bowl Body */}
            <path d="M20 60 C20 130 60 150 100 150 C140 150 180 130 180 60 L180 50 L20 50 Z" fill="url(#bowlGradient)" />
            {/* Bowl Rim */}
            <ellipse cx="100" cy="50" rx="80" ry="15" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
            {/* Reflection */}
            <path d="M40 80 C40 120 70 130 100 130" stroke="white" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
            {/* Stick */}
            <rect x="80" y="10" width="140" height="20" rx="10" transform="rotate(-15 100 20)" fill="#8B4513" />
          </svg>
        )}
      </motion.div>
      
      <p className="mt-4 text-sm text-zen-accent/60 italic">
        {appearance === 'fish' ? t('wooden_fish_desc') : 
         appearance === 'lotus' ? t('lotus_desc') : 
         t('bowl_desc')}
      </p>
    </div>
  );
};

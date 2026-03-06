import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Loader2, MessageCircle, X, Play, Pause } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { cn } from '../lib/utils';

export const LiveMeditation: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isInterrupted, setIsInterrupted] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const connect = async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setTranscript([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Setup Audio Context
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      // Connect to Live API
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "你是一位智慧、平和的禅师。你正在引导用户进行实时冥想。你的声音应该轻柔、有节奏。你可以根据用户的反馈调整引导内容。如果用户感到焦虑，请给予安慰；如果用户感到分心，请温柔地引导他们回到呼吸。保持对话简短且充满禅意。",
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            // Start Microphone Capture
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = stream;
              const source = audioContextRef.current!.createMediaStreamSource(stream);
              
              // We need a simple processor to send audio chunks
              // In a real app, we'd use an AudioWorklet, but for simplicity here we use ScriptProcessor (deprecated but works for demo)
              // or a simple buffer approach.
              const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
              source.connect(processor);
              processor.connect(audioContextRef.current!.destination);
              
              processor.onaudioprocess = (e) => {
                if (!isMuted && sessionRef.current) {
                  const inputData = e.inputBuffer.getChannelData(0);
                  // Convert Float32 to Int16 PCM
                  const pcmData = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
                  }
                  const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
                  sessionRef.current.sendRealtimeInput({
                    media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
                }
              };
            } catch (err) {
              console.error("Microphone access denied:", err);
              cleanup();
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcmData = new Int16Array(bytes.buffer);
              const floatData = new Float32Array(pcmData.length);
              for (let i = 0; i < pcmData.length; i++) {
                floatData[i] = pcmData[i] / 0x7FFF;
              }
              
              const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
              buffer.getChannelData(0).set(floatData);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              
              const startTime = Math.max(audioContextRef.current.currentTime, nextStartTimeRef.current);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
            }
            
            // Handle Interruption
            if (message.serverContent?.interrupted) {
              setIsInterrupted(true);
              nextStartTimeRef.current = 0;
              // In a real app, we'd stop current playback
            }
            
            // Handle Transcriptions
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              const text = message.serverContent.modelTurn.parts[0].text;
              setTranscript(prev => [...prev, { role: 'model', text }]);
            }
            
            const userText = (message.serverContent as any)?.userTranscription?.text;
            if (userText) {
              setTranscript(prev => [...prev, { role: 'user', text: userText }]);
            }
          },
          onclose: () => cleanup(),
          onerror: (err) => {
            console.error("Live API Error:", err);
            cleanup();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
      
    } catch (err) {
      console.error("Connection failed:", err);
      cleanup();
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Interaction Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-zen-accent/5 flex flex-col items-center text-center relative overflow-hidden min-h-[500px] justify-center">
            {/* Visualizer / Animation */}
            <div className="relative mb-12">
              <AnimatePresence>
                {isConnected && (
                  <>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.1, 0.3, 0.1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-zen-accent rounded-full blur-3xl -z-10"
                    />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-48 h-48 rounded-full border-4 border-zen-accent/20 flex items-center justify-center"
                    >
                      <div className="w-32 h-32 rounded-full bg-zen-accent/5 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-zen-accent" />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              
              {!isConnected && !isConnecting && (
                <div className="w-48 h-48 rounded-full bg-zen-bg flex items-center justify-center border-2 border-dashed border-zen-accent/20">
                  <MessageCircle className="w-12 h-12 text-zen-accent/20" />
                </div>
              )}
              
              {isConnecting && (
                <div className="w-48 h-48 rounded-full flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-zen-accent animate-spin" />
                </div>
              )}
            </div>

            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-serif font-bold mb-4">
                {isConnected ? "正在与禅师对话..." : isConnecting ? "正在连接智慧之源..." : "开启实时语音引导"}
              </h2>
              <p className="text-sm text-zen-accent/60 leading-relaxed mb-10">
                {isConnected 
                  ? "请放松呼吸，您可以随时向禅师提问或分享您的感受。" 
                  : "通过实时语音，禅师将根据您的状态为您提供个性化的冥想引导。"}
              </p>

              <div className="flex items-center justify-center gap-4">
                {!isConnected ? (
                  <button
                    onClick={connect}
                    disabled={isConnecting}
                    className="bg-zen-accent text-white px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
                  >
                    {isConnecting ? "连接中..." : "开始对话"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all",
                        isMuted ? "bg-red-50 text-red-500" : "bg-zen-bg text-zen-accent"
                      )}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={cleanup}
                      className="bg-zen-ink text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-black transition-colors"
                    >
                      结束对话
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Transcript / Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-zen-accent/5 h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zen-accent/40">智慧语录</h3>
              <div className="w-2 h-2 rounded-full bg-zen-accent animate-pulse" />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {transcript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30 italic text-xs">
                  <MessageCircle className="w-8 h-8 mb-4" />
                  <p>对话开始后，禅师的教诲将记录于此。</p>
                </div>
              ) : (
                transcript.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-4 rounded-2xl text-xs leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-zen-bg ml-8 text-right" 
                        : "bg-zen-accent/5 mr-8 border border-zen-accent/5"
                    )}
                  >
                    <p className={cn(
                      "font-bold mb-1 uppercase tracking-tighter text-[8px]",
                      msg.role === 'user' ? "text-zen-accent/40" : "text-zen-accent"
                    )}>
                      {msg.role === 'user' ? "您" : "禅师"}
                    </p>
                    {msg.text}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
            <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              使用建议
            </h4>
            <ul className="text-[10px] text-amber-700/80 space-y-2 leading-relaxed">
              <li>• 找一个安静的环境，佩戴耳机效果更佳。</li>
              <li>• 您可以对禅师说：“我感到很有压力”或“请引导我放松”。</li>
              <li>• 禅师会实时倾听并回应您的呼吸与心声。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

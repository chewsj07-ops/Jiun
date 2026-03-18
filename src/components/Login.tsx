import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/api/register' : '/api/login';
    const body = isRegister 
      ? { email, password, name, location, country } 
      : { email, password };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (response.ok) {
      onLogin(data.user);
    } else {
      setError(data.error || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zen-bg/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-zen-accent/5"
      >
        <h2 className="text-2xl font-serif font-bold mb-6 text-center">{isRegister ? '注册' : '登录'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zen-accent/50" />
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zen-bg/50 border border-zen-accent/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-zen-accent/30"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zen-accent/50" />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zen-bg/50 border border-zen-accent/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-zen-accent/30"
            />
          </div>
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zen-bg/50 border border-zen-accent/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zen-accent/30"
              />
              <input
                type="text"
                placeholder="地点"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zen-bg/50 border border-zen-accent/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zen-accent/30"
              />
              <input
                type="text"
                placeholder="国家"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-zen-bg/50 border border-zen-accent/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zen-accent/30"
              />
            </>
          )}
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-zen-accent text-white py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity"
          >
            {isRegister ? '注册' : '登录'}
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-zen-accent/60 text-xs font-bold hover:text-zen-accent"
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

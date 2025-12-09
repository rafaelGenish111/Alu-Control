import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Backend server address (computer IP) - updated according to Vite log: 192.168.150.119
  // If the IP changes in the future, update it here
  const API_URL = 'http://192.168.150.119:5000/api'; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // reset previous errors
    
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // store token
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      
      // set preferred language
      if(res.data.language) {
        i18n.changeLanguage(res.data.language);
      }
      
      // smart routing: installer goes to installer app, others to dashboard
      if (res.data.role === 'installer') {
        navigate('/installer');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error("Login Error:", err);
      // distinguish between network error and invalid credentials
      if (err.code === "ERR_NETWORK") {
        setError('Network error: server is not reachable or the URL is wrong');
      } else {
        setError('Login failed. Please check your email and password.');
      }
    }
  };

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800">
        
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button onClick={toggleLang} className="text-slate-400 hover:text-white text-sm font-bold">
            {i18n.language === 'en' ? '🇪🇸 Español' : '🇺🇸 English'}
          </button>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Glass Dynamic</h1>
        <p className="text-slate-400 text-center mb-8">{t('welcome')}</p>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">{t('email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition"
              placeholder="user@glass.com"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">{t('password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-900/20 mt-2">
            {t('login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config/api';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // reset previous errors

    // Validate inputs before sending
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });

      // store token
      localStorage.setItem('userInfo', JSON.stringify(res.data));

      // smart routing: installer goes to installer app, others to dashboard
      if (res.data.role === 'installer') {
        navigate('/installer');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error("Login Error:", err);
      console.error("Error response:", err.response?.data);
      // distinguish between network error and invalid credentials
      if (err.code === "ERR_NETWORK") {
        setError('Network error: server is not reachable or the URL is wrong');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid request. Please check your email and password.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your email and password.');
      }
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-white flex items-center justify-center p-4">
      <div className="dark:bg-slate-900 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border dark:border-slate-800 border-gray-200">

        <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2 text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Glass Dynamic</h1>
        <p className="dark:text-slate-400 text-gray-600 text-center mb-8">{t('welcome')}</p>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block dark:text-slate-400 text-gray-600 text-sm mb-1">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-slate-700 border-gray-300 rounded-xl p-3 dark:text-white text-gray-900 focus:border-blue-500 outline-none transition"
              placeholder="user@glass.com"
            />
          </div>
          <div className="relative">
            <label className="block dark:text-slate-400 text-gray-600 text-sm mb-1">{t('password')}</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-slate-700 border-gray-300 rounded-xl p-3 dark:text-white text-gray-900 focus:border-blue-500 outline-none transition pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[32px] dark:text-slate-500 text-gray-500 hover:dark:text-white hover:text-gray-900 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="w-full bg-primary hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition shadow-lg mt-2">
            {t('login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
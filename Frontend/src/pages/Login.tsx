import React, { useState } from 'react'
import axios from 'axios'
import { useToast } from '../components/ToastContext'

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

export default function LoginPage({ onLogin }: { onLogin: (token: string) => void }){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login'|'register'>('login');

  const toast = useToast();

  async function submit(e: any){
    e.preventDefault();
    try{
      if(mode === 'login'){
        const res = await axios.post(API_BASE + '/api/auth/login', { username, password });
        if(res.data.ok) onLogin(res.data.token);
        else toast.show('Login failed', 'error');
      } else {
        const reg = await axios.post(API_BASE + '/api/auth/register', { username, password });
        if(reg.data.ok){
          const res = await axios.post(API_BASE + '/api/auth/login', { username, password });
          if(res.data.ok) onLogin(res.data.token);
  } else toast.show('Register failed', 'error');
      }
    } catch (err: any){
      toast.show(err?.response?.data?.error || String(err), 'error');
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6 items-center">
      <div className="p-6">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <div className="p-8 bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center"> 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
                <p className="text-sm opacity-90">Fast support with clear conversation tracking.</p>
              </div>
            </div>
            <div className="mt-6 text-sm opacity-90">Use your account to submit complaints and chat with our support team. We respond quickly.</div>
          </div>
          <div className="p-6 bg-gradient-to-t from-white/80 to-transparent">
            <div className="flex gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded" />
              <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded" />
              <div className="w-2 h-8 bg-gradient-to-b from-pink-400 to-purple-500 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="app-card">
          <h3 className="text-xl font-semibold mb-4">{mode === 'login' ? 'Sign in' : 'Register'}</h3>
          <form onSubmit={submit} className="space-y-4">
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" className="w-full border rounded px-3 py-2" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" className="w-full border rounded px-3 py-2" />
            <div className="flex items-center justify-between">
              <button type="submit" className="px-4 py-2 rounded brand-btn">{mode === 'login' ? 'Login' : 'Register'}</button>
              <button type="button" onClick={()=>setMode(mode === 'login' ? 'register' : 'login')} className="text-sm text-slate-600">{mode === 'login' ? 'Switch to Register' : 'Switch to Login'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import UserChat from './pages/UserChat'
import AdminDashboard from './pages/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import { ToastProvider } from './components/ToastContext'
import { isAdmin } from './utils/auth'
import { Navigate } from 'react-router-dom'

export default function App(){
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  function logout(){
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50">
      <header className="bg-white/60 backdrop-blur sticky top-0 z-20 shadow">
        <div className="max-w-6xl mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg brand-btn flex items-center justify-center text-white font-bold">CS</div>
            <h1 className="text-xl font-semibold">Customer Service</h1>
          </div>
          <nav className="space-x-4 flex items-center">
            {!isAdmin() && <Link className="text-slate-600 hover:text-slate-900" to="/">Home</Link>}
            <Link className="text-slate-600 hover:text-slate-900" to="/admin">Admin</Link>
            {token ? <button className="px-3 py-1 bg-slate-100 rounded" onClick={logout}>Logout</button> : <Link className="px-4 py-2 brand-btn rounded text-white" to="/login">Login</Link>}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <ToastProvider>
          <div className="app-card">
            <Routes>
              <Route path="/login" element={<LoginPage onLogin={(t)=>{ setToken(t); localStorage.setItem('token', t); navigate('/'); }} />} />
              <Route path="/" element={isAdmin() ? <Navigate to="/admin" replace /> : <UserChat token={token} />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard token={token} />} />
              </Route>
            </Routes>
          </div>
        </ToastProvider>
      </main>
    </div>
  )
}

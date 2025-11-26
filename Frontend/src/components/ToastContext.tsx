import React, { createContext, useContext, useState, ReactNode } from 'react'

type Toast = { id: string; type: 'success'|'error'|'info'; message: string }

const ToastCtx = createContext<any>(null);

export function useToast(){ return useContext(ToastCtx); }

export function ToastProvider({ children }: { children: ReactNode }){
  const [toasts, setToasts] = useState<Toast[]>([]);

  function show(message: string, type: Toast['type']='info', timeout=4000){
    const id = String(Date.now()) + Math.random().toString(36).slice(2,6);
    setToasts(t=>[...t, { id, message, type }]);
    setTimeout(()=> setToasts(t=>t.filter(x=>x.id !== id)), timeout);
  }

  function remove(id: string){ setToasts(t=>t.filter(x=>x.id !== id)); }

  return (
    <ToastCtx.Provider value={{ show, remove }}>
      {children}
      <div className="fixed right-4 top-4 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded-lg shadow-lg text-white ${t.type==='success'? 'bg-green-500' : t.type==='error'? 'bg-red-500' : 'bg-sky-500'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

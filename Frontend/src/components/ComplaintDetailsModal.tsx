import React, { useState } from 'react'

export default function ComplaintDetailsModal({ open, onClose, complaint, onReply }: { open: boolean, onClose: ()=>void, complaint?: any, onReply: (text: string)=>Promise<void> }){
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  if(!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Complaint Details</h3>
          <button className="text-sm text-slate-500" onClick={onClose}>Close</button>
        </div>

        <div className="space-y-3 max-h-80 overflow-auto mb-4">
          <div className="text-sm text-slate-500">From: <span className="font-medium">{complaint?.user?.username}</span></div>
          <div className="text-xs text-slate-400">{new Date(complaint?.createdAt).toLocaleString?.()}</div>
          {complaint?.messages?.map((m: any, i: number)=> (
            <div key={i} className={m.from === 'admin' ? 'msg-bubble msg-admin self-end' : 'msg-bubble msg-user'}>
              {m.text}
              {m.image && <div className="mt-2"><img src={(import.meta as any).env?.VITE_API_BASE ? (import.meta as any).env.VITE_API_BASE + m.image : 'http://localhost:4000' + m.image} alt="attachment" className="max-w-full rounded" /></div>}
              <div className="text-xs text-slate-200 mt-1">{new Date(m.createdAt).toLocaleTimeString?.()}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="reply as admin..." className="flex-1 border rounded px-3 py-2" />
          <input type="file" onChange={e=>setFile(e.target.files ? e.target.files[0] : null)} />
          <button className="px-3 py-2 rounded brand-btn" onClick={async ()=>{ if(text.trim() || file){
              // send via onReply wrapper expecting text and file handling in parent
              // we pass here only text; parent will not know file, so we instead call backend directly
              if(!complaint) return;
              const API = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
              const token = localStorage.getItem('token');
              if(!token) return;
              try{
                if(file){
                  const fd = new FormData();
                  if(text) fd.append('text', text);
                  fd.append('image', file);
                  await fetch(API + `/api/complaints/${complaint._id}/messages`, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
                } else {
                  await fetch(API + `/api/complaints/${complaint._id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ text }) });
                }
                setText(''); setFile(null);
                await onReply(text);
              } catch(e){ /* ignore */ }
            } }}>Send</button>
        </div>
      </div>
    </div>
  )
}

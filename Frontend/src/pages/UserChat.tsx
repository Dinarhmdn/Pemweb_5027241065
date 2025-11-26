import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useToast } from '../components/ToastContext'

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

export default function UserChat({ token }: { token: string | null }){
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const toast = useToast();
  const [startNew, setStartNew] = useState(false);
  const [replyMap, setReplyMap] = useState<Record<string,string>>({});

  useEffect(()=>{ if(token) fetchList(); }, [token]);

  async function fetchList(){
  const res = await axios.get(API_BASE + '/api/complaints', { headers: { Authorization: 'Bearer ' + token } }).catch(()=>null);
    if(res && res.data && res.data.list) setComplaints(res.data.list);
    else {
      // fetch user's own complaints: get all and filter on frontend if API doesn't provide
  const meRes = await axios.get(API_BASE + '/api/complaints', { headers: { Authorization: 'Bearer ' + token } }).catch(()=>null);
      if(meRes && meRes.data && meRes.data.list) setComplaints(meRes.data.list);
    }
  }

  async function start(){
    if(!token) return toast.show('Please login first', 'error');
    try {
      const openComplaint = !startNew ? complaints.find(c => c.status === 'open') : null;
      let res: any = null;

      if (openComplaint) {
        if (file) {
          const fd = new FormData();
          if (text) fd.append('text', text);
          fd.append('image', file);
          res = await axios.post(API_BASE + `/api/complaints/${openComplaint._id}/messages`, fd, { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/form-data' } });
        } else {
          res = await axios.post(API_BASE + `/api/complaints/${openComplaint._id}/messages`, { text }, { headers: { Authorization: 'Bearer ' + token } });
        }
        if (res?.data?.ok) {
          setText(''); setFile(null); fetchList(); toast.show('Message sent in existing thread', 'success');
        }
      } else {
        if (file) {
          const fd = new FormData();
          if (text) fd.append('text', text);
          fd.append('image', file);
          res = await axios.post(API_BASE + '/api/complaints', fd, { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/form-data' } });
        } else {
          res = await axios.post(API_BASE + '/api/complaints', { text }, { headers: { Authorization: 'Bearer ' + token } });
        }
        if (res?.data?.ok) {
          setText(''); setFile(null); fetchList(); toast.show('Complaint sent', 'success');
        }
      }
    } catch (err: any) {
      toast.show(err?.response?.data?.error || String(err), 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="app-card">
        <h2 className="text-lg font-medium">New Complaint</h2>
        <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full border rounded mt-2 p-3" rows={4} />
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-slate-500">You can send screenshots or details here.</div>
          <div className="flex items-center gap-3">
            <label className="text-sm"><input type="checkbox" checked={startNew} onChange={e=>setStartNew(e.target.checked)} /> Start new complaint</label>
            <input type="file" onChange={e=>setFile(e.target.files ? e.target.files[0] : null)} />
            <button className="px-4 py-2 rounded brand-btn" onClick={start}>Send</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Complaints</h3>
        <ul className="space-y-4">
          {complaints.map(c=> (
            <li key={c._id} className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{c.user?.username || 'you'}</div>
                  <div className="text-sm text-slate-500">{new Date(c.createdAt).toLocaleString?.() || ''}</div>
                </div>
                <div className={`status-badge ${c.status === 'open' ? 'status-open' : 'status-closed'}`}>{c.status}</div>
              </div>
              <div className="mt-3 space-y-2">
                {c.messages?.map((m: any, i: number)=> (
                  <div key={i} className={`msg-row ${m.from === 'admin' ? 'text-right' : 'text-left'}`}>
                    <div className={m.from === 'admin' ? 'msg-bubble msg-admin' : 'msg-bubble msg-user'}>
                      {m.text}
                      {m.image && <div className="mt-2"><img src={(import.meta as any).env?.VITE_API_BASE ? (import.meta as any).env.VITE_API_BASE + m.image : 'http://localhost:4000' + m.image} alt="attachment" className="max-w-full rounded" /></div>}
                      <div className="text-xs text-slate-500 mt-1">{new Date(m.createdAt).toLocaleTimeString?.()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2 items-center">
                <input value={replyMap[c._id] || ''} onChange={e=>setReplyMap(prev=>({ ...prev, [c._id]: e.target.value }))} placeholder="reply in this chat..." className="flex-1 border rounded px-3 py-2" />
                <button className="px-3 py-2 rounded brand-btn" onClick={async ()=>{
                  if(!token) return toast.show('Please login', 'error');
                  const text = replyMap[c._id] || '';
                  if(!text) return toast.show('Reply is empty', 'error');
                  try{
                    const res = await axios.post(API_BASE + `/api/complaints/${c._id}/messages`, { text }, { headers: { Authorization: 'Bearer ' + token } });
                    if(res.data.ok){ setReplyMap(prev=>{ const next = { ...prev }; delete next[c._id]; return next; }); fetchList(); toast.show('Reply sent', 'success'); }
                  }catch(e:any){ toast.show(e?.response?.data?.error || String(e), 'error'); }
                }}>Reply</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

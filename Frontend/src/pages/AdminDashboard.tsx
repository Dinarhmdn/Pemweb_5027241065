import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useToast } from '../components/ToastContext'
import ConfirmModal from '../components/ConfirmModal'
import ComplaintDetailsModal from '../components/ComplaintDetailsModal'

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

export default function AdminDashboard({ token }: { token: string | null }){
  const [list, setList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  // per-complaint reply text map: { [complaintId]: text }
  const [replyMap, setReplyMap] = useState<Record<string,string>>({});
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [targetComplaint, setTargetComplaint] = useState<any>(null);

  function openDetails(c: any){
    // fetch latest complaint details from backend then open modal
    (async ()=>{
      try{
        if(!token) { toast.show('Please login', 'error'); return; }
        const res = await axios.get(API_BASE + `/api/complaints/${c._id}`, { headers: { Authorization: 'Bearer ' + token } }).catch(()=>null);
        if(res && res.data && res.data.complaint){
          setTargetComplaint(res.data.complaint);
          setDetailOpen(true);
        } else {
          toast.show('Failed to load complaint', 'error');
        }
      } catch(err:any){
        toast.show(err?.response?.data?.error || String(err), 'error');
      }
    })();
  }

  useEffect(()=>{ fetchList(); }, []);

  useEffect(()=>{ if(token) fetchUsers(); }, [token]);

  async function fetchUsers(){
    if(!token) return;
    const res = await axios.get(API_BASE + '/api/admin/users', { headers: { Authorization: 'Bearer ' + token } }).catch(()=>null);
    if(res && res.data && res.data.users) setUsers(res.data.users);
  }

  async function fetchList(){
    const res = await axios.get(API_BASE + '/api/complaints', { headers: { Authorization: 'Bearer ' + token } }).catch(()=>null);
    if(res && res.data && res.data.list) setList(res.data.list);
  }

  async function sendReply(id: string){
    const text = replyMap[id] || '';
    if(!token) return toast.show('Please login', 'error');
    if(!text) return toast.show('Reply is empty', 'error');
    try{
      const res = await axios.post(API_BASE + `/api/complaints/${id}/messages`, { text }, { headers: { Authorization: 'Bearer ' + token } });
      if(res.data.ok) {
        // clear only this complaint's reply
        setReplyMap(prev => { const next = { ...prev }; delete next[id]; return next; });
        fetchList();
        toast.show('Reply sent', 'success');
      }
    } catch (err:any){
      toast.show(err?.response?.data?.error || String(err), 'error');
    }
  }

  async function replyFromModal(id: string, text: string){
    if(!token) return toast.show('Please login', 'error');
    try{
      const res = await axios.post(API_BASE + `/api/complaints/${id}/messages`, { text }, { headers: { Authorization: 'Bearer ' + token } });
      if(res.data.ok) { fetchList(); toast.show('Reply sent', 'success'); }
    } catch (err:any){
      toast.show(err?.response?.data?.error || String(err), 'error');
    }
  }

  async function promoteUser(id: string){
    if(!token) return toast.show('Please login', 'error');
    try{
      const res = await axios.post(API_BASE + `/api/admin/promote/${id}`, {}, { headers: { Authorization: 'Bearer ' + token } }).catch(()=>null);
      if(res && res.data && res.data.ok) { fetchUsers(); toast.show('User promoted', 'success'); }
    } catch (err:any){
      toast.show(err?.response?.data?.error || String(err), 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <div className="text-sm text-slate-500">Total: {list.length}</div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <ul className="space-y-2">
            {users.map(u=> (
              <li key={u._id} className="flex items-center justify-between p-3 bg-white rounded">
                <div>
                  <div className="font-medium">{u.username}</div>
                  <div className="text-sm text-slate-500">{u.isAdmin ? 'Admin' : 'User'}</div>
                </div>
                {!u.isAdmin && <button className="px-3 py-1 rounded brand-btn text-sm" onClick={()=>{ setTargetUser(u); setConfirmOpen(true); }}>Promote</button>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Complaints</h3>
          <ul className="space-y-4">
            {list.map(c=> (
              <li key={c._id} className="app-card">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-medium">{(c.user?.username || 'U').charAt(0).toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{c.user?.username}</div>
                        <div className="text-sm text-slate-500">{new Date(c.createdAt).toLocaleString?.()}</div>
                      </div>
                      <div className={`status-badge ${c.status === 'open' ? 'status-open' : 'status-closed'}`}>{c.status}</div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {c.messages?.map((m: any, i: number)=> (
                        <div key={i} className={m.from === 'admin' ? 'msg-bubble msg-admin self-end' : 'msg-bubble msg-user'}>
                          {m.text}
                          {m.image && <div className="mt-2"><img src={(import.meta as any).env?.VITE_API_BASE ? (import.meta as any).env.VITE_API_BASE + m.image : 'http://localhost:4000' + m.image} alt="attachment" className="max-w-full rounded" /></div>}
                          <div className="text-xs text-slate-200 mt-1">{new Date(m.createdAt).toLocaleTimeString?.()}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-2 rounded brand-btn" onClick={()=>openDetails(c)}>Open details</button>
                      <input value={replyMap[c._id] || ''} onChange={e=>setReplyMap(prev=>({ ...prev, [c._id]: e.target.value }))} placeholder="reply..." className="flex-1 border rounded px-3 py-2" />
                      <button className="px-3 py-2 rounded brand-btn" onClick={()=>sendReply(c._id)}>Reply</button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ConfirmModal open={confirmOpen} title="Promote user" message={`Promote ${targetUser?.username} to admin?`} onClose={()=>setConfirmOpen(false)} onConfirm={()=>{ setConfirmOpen(false); if(targetUser) promoteUser(targetUser._id); }} />
      <ComplaintDetailsModal open={detailOpen} complaint={targetComplaint} onClose={()=>setDetailOpen(false)} onReply={async (text)=>{ if(targetComplaint) await replyFromModal(targetComplaint._id, text); setDetailOpen(false); }} />
    </div>
  )
}

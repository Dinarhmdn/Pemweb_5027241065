import React from 'react'

export default function ConfirmModal({ open, title, message, onConfirm, onClose }: { open: boolean; title?: string; message?: string; onConfirm: ()=>void; onClose: ()=>void }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">{title || 'Confirm'}</h3>
        <p className="mt-2 text-sm text-slate-600">{message || 'Are you sure?'}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button className="px-3 py-1 rounded border" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1 rounded brand-btn" onClick={()=>{ onConfirm(); onClose(); }}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

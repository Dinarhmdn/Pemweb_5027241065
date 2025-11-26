# Customer Service

Dina Rahmadani - 5027241065

# Ringkasan singkat
Aplikasi ini adalah customer-service full‑stack: frontend React + TypeScript (Vite + Tailwind) dan backend Express + TypeScript dengan MongoDB. Pengguna bisa mendaftar/login, membuat keluhan (komplain) yang menjadi satu “room” chat, mengunggah gambar, dan berkomunikasi dengan admin; admin punya dashboard untuk melihat semua complaint, membuka detail, membalas, dan mempromosikan user jadi admin.

# Teknologi
Frontend: Vite, React (TSX), TypeScript, Tailwind CSS, Axios, React Router.
Backend: Node.js, Express (TypeScript), Mongoose (MongoDB), multer (file upload), jsonwebtoken, bcryptjs.
Auth: JWT (token disimpan di localStorage); backend middleware memverifikasi token dan hak akses (requireAuth, requireAdmin, requireOwnerOrAdmin).
Penyimpanan file: local uploads/ disajikan statis via Express.

# Fitur utama
Register / Login (password di-hash, register hanya user biasa).
Keluhan sebagai thread/chat (Complaint model), pesan berisi text dan/atau image.
Admin:
Melihat semua complaint, membuka detail, membalas.
List user dan promote user -> admin (backend-only guard).
User:
Buat complaint baru atau balas ke complaint yang masih open.
Upload gambar saat buat/balas.
UI: Toasts untuk error/success, confirm modal untuk tindakan sensitif.

# File & endpoint penting

# Frontend:
Login.tsx — login/register UI
UserChat.tsx — buat complaint, lihat list, reply (user)
AdminDashboard.tsx — admin list, open details, reply, promote
ComplaintDetailsModal.tsx — modal detail + reply
ToastContext.tsx — toast provider

# Backend:
auth.ts — POST /api/auth/register, /api/auth/login
complaint.ts —
POST /api/complaints (buat complaint, multipart/form-data untuk image)
POST /api/complaints/:id/messages (tambah pesan, multipart)
GET /api/complaints (admin semua, user hanya miliknya)
GET /api/complaints/:id (owner atau admin)
admin.ts — GET /api/admin/users, POST /api/admin/promote/:id
Complaint.ts, User.ts
auth.ts — requireAuth, requireAdmin, requireOwnerOrAdmin

# Cara menjalankan (lokal)
Backend:
```
cd Backend
npm install
cp .env.example .env   # set MONGO_URI, JWT_SECRET, PORT
npm run dev
```
Frontend:
```
cd Frontend
npm install
cp .env.example .env   # set VITE_API_BASE (optional)
npm run dev
```

# Tampilan Web

Tampilan login admin
<img width="1460" height="761" alt="Screenshot 2025-11-26 at 20 11 16" src="https://github.com/user-attachments/assets/21425306-3156-4072-8be7-ea177b75a95a" />


<img width="1460" height="761" alt="Screenshot 2025-11-26 at 20 20 57" src="https://github.com/user-attachments/assets/fe244435-ace1-41bc-966f-5240b73d3b94" />


<img width="1453" height="762" alt="Screenshot 2025-11-26 at 20 22 31" src="https://github.com/user-attachments/assets/47471113-6cba-4434-9ac7-8396badc31b9" />



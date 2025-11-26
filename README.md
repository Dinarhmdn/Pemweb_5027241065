# Pemweb Customer Service

This repo contains a simple customer service app split into `Backend/` (Express + TypeScript + MongoDB) and `Frontend/` (React + TypeScript + Vite).

Run backend:

1. cd Backend
2. npm install
3. copy `.env.example` -> `.env` and set MONGO_URI
4. npm run dev

Run frontend:

1. cd Frontend
2. npm install
3. npm run dev

Requirements coverage:
- Frontend in React (tsx): done (in `Frontend/`)
- Backend in Express (ts): done (in `Backend/`)
- MongoDB persistence: done (Mongoose models included)
- Auth (login) for users: done (JWT-based)
- Users can submit complaints/chat: done (API + simple UI)
- Admin can view and reply: done (API + admin UI)

# Pemweb_5027241065
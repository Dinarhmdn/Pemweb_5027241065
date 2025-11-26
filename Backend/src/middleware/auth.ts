import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Complaint from '../models/Complaint';

export interface AuthRequest extends Request {
  user?: { userId: string; isAdmin?: boolean };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ ok: false, error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
  const data = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
  // debug log token payload
//   console.log('[auth] token payload:', data);
  req.user = { userId: data.userId, isAdmin: data.isAdmin };
    next();
  } catch (err) {
    res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction){
  if (!req.user) return res.status(401).json({ ok: false, error: 'Missing authentication' });
  if (!req.user.isAdmin) return res.status(403).json({ ok: false, error: 'Admin only' });
  next();
}

// ownerId can be passed in request params or as a function argument when needed
export async function requireOwnerOrAdmin(req: AuthRequest, res: Response, next: NextFunction){
  if (!req.user) return res.status(401).json({ ok: false, error: 'Missing authentication' });
  if (req.user.isAdmin) return next();

  // If this route has an :id param (e.g. complaint id), try to load the complaint and check owner
  const id = (req.params as any).id;
  if (id){
    try{
      const complaint = await Complaint.findById(id);
      if(!complaint) return res.status(404).json({ ok: false, error: 'Not found' });
      if(String(complaint.user) !== String(req.user.userId)){
        console.warn('[auth] Forbidden access attempt: req.user=', req.user, ' complaint.user=', String(complaint.user), ' id=', id);
        return res.status(403).json({ ok: false, error: 'Forbidden' });
      }
      return next();
    } catch(err){
      return res.status(500).json({ ok: false, error: String(err) });
    }
  }

  const ownerId = (req.body && (req.body as any).userId) || null;
  if (!ownerId) return res.status(400).json({ ok: false, error: 'Missing owner id' });
  if (String(ownerId) !== String(req.user.userId)) return res.status(403).json({ ok: false, error: 'Forbidden' });
  next();
}

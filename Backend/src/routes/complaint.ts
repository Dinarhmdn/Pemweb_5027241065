import { Router } from 'express';
import Complaint from '../models/Complaint';
import { requireAuth, requireAdmin, requireOwnerOrAdmin, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = Router();

const upload = multer({ dest: path.join(__dirname, '../../uploads') });

// Create new complaint (starts a chat) - supports optional image upload
router.post('/', requireAuth, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;
  const image = (req as any).file ? `/uploads/${(req as any).file.filename}` : undefined;
    const message: any = { from: 'user', createdAt: new Date() };
    if (text) message.text = text;
    if (image) message.image = image;
    const complaint = new Complaint({ user: req.user!.userId, messages: [message], status: 'open' });
    await complaint.save();
  console.log('[complaint] created complaint', complaint._id, 'owner=', complaint.user);
    res.json({ ok: true, complaint });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err) });
  }
});

// Add message to complaint (reply) - supports optional image upload
router.post('/:id/messages', requireAuth, requireOwnerOrAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const image = (req as any).file ? `/uploads/${(req as any).file.filename}` : undefined;
    const message: any = { from: req.user!.isAdmin ? 'admin' : 'user', createdAt: new Date() };
    if (text) message.text = text;
    if (image) message.image = image;

    // Atomic push to avoid any accidental shared state
    const updated = await Complaint.findByIdAndUpdate(id, { $push: { messages: message } }, { new: true }).populate('user', 'username');
    console.log('[complaint] pushed message to', id, 'resulting messages count=', updated?.messages?.length);
    if (!updated) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, complaint: updated });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err) });
  }
});

// List complaints: admin sees all, regular users see their own
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user && req.user.isAdmin) {
      const list = await Complaint.find().populate('user', 'username');
      return res.json({ ok: true, list });
    }
    // regular user: return only their complaints
    const list = await Complaint.find({ user: req.user!.userId }).populate('user', 'username');
    res.json({ ok: true, list });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Get one complaint (admin or owner)
router.get('/:id', requireAuth, requireOwnerOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).populate('user', 'username');
    if (!complaint) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, complaint });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;

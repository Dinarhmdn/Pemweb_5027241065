import { Router } from 'express';
import User from '../models/User';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// List users (admin only)
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('username isAdmin createdAt');
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Promote a user to admin (admin only)
router.post('/promote/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if(!user) return res.status(404).json({ ok: false, error: 'User not found' });
    user.isAdmin = true;
    await user.save();
    res.json({ ok: true, user: { id: user._id, username: user.username, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;

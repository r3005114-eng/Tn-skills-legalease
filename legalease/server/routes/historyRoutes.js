import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { repo } from '../models/repository.js';

const router = express.Router();

// GET /api/history
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const conversations = await repo.conversations.find({ userId });
    
    res.json({
      success: true,
      conversations: conversations.map(c => ({
        id: c._id || c.id,
        title: c.title,
        lastMessage: c.lastMessage,
        hasAttachments: c.hasAttachments,
        messageCount: (c.messages || []).length,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/history/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const conversation = await repo.conversations.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }
    res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/history/:id
router.patch('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required.' });
    }
    const updated = await repo.conversations.findByIdAndUpdate(req.params.id, {
      title: title.trim(),
      updatedAt: new Date()
    });
    res.json({ success: true, conversation: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/history/:id
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    await repo.conversations.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;

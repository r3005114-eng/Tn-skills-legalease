import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { repo } from '../models/repository.js';
import { generateLegalResponse } from '../services/geminiService.js';

const router = express.Router();

// POST /api/chat
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { message, conversationId, documentContext, jurisdiction, attachments } = req.body;
    const userId = req.user._id || req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Please enter a legal query or message.' });
    }

    let conversation = null;
    if (conversationId) {
      conversation = await repo.conversations.findById(conversationId);
    }

    if (!conversation) {
      // Auto-generate title from first query
      const title = message.trim().slice(0, 48) + (message.length > 48 ? '...' : '');
      conversation = await repo.conversations.create({
        userId,
        title,
        messages: [],
        hasAttachments: !!(attachments && attachments.length > 0),
        lastMessage: message.trim()
      });
    }

    // Append user message
    const userMsg = {
      sender: 'user',
      content: message.trim(),
      attachments: attachments || [],
      createdAt: new Date()
    };

    // Generate AI legal response
    const aiStructured = await generateLegalResponse({
      message: message.trim(),
      history: conversation.messages || [],
      documentContext: documentContext || '',
      jurisdiction: jurisdiction || req.user.jurisdiction || 'India',
      userApiKey: req.headers['x-gemini-api-key'] || null
    });

    const assistantMsg = {
      sender: 'assistant',
      content: aiStructured.answer,
      structuredResponse: aiStructured,
      attachments: [],
      createdAt: new Date()
    };

    const updatedMessages = [...(conversation.messages || []), userMsg, assistantMsg];

    await repo.conversations.findByIdAndUpdate(conversation._id || conversation.id, {
      messages: updatedMessages,
      lastMessage: aiStructured.answer.slice(0, 100),
      hasAttachments: (conversation.hasAttachments || (attachments && attachments.length > 0)),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      conversationId: conversation._id || conversation.id,
      message: assistantMsg,
      structuredResponse: aiStructured,
      disclaimer: "LegalEase provides general legal information and drafting assistance. It is not a substitute for advice from a qualified legal professional."
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/chat/feedback
router.post('/feedback', optionalAuth, async (req, res, next) => {
  try {
    const { conversationId, messageIndex, feedback } = req.body;
    if (!conversationId || messageIndex === undefined) {
      return res.status(400).json({ success: false, error: 'Conversation ID and message index required.' });
    }

    const conversation = await repo.conversations.findById(conversationId);
    if (!conversation || !conversation.messages[messageIndex]) {
      return res.status(404).json({ success: false, error: 'Message not found.' });
    }

    conversation.messages[messageIndex].feedback = feedback;
    await repo.conversations.findByIdAndUpdate(conversationId, {
      messages: conversation.messages
    });

    res.json({ success: true, message: 'Feedback recorded successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;

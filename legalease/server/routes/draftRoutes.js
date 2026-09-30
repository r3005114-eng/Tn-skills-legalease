import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { repo } from '../models/repository.js';
import { generateLegalDraft } from '../services/geminiService.js';
import { generatePdfBuffer, generateDocxBuffer } from '../services/documentGenerator.js';

const router = express.Router();

// POST /api/drafts/generate
router.post('/generate', optionalAuth, async (req, res, next) => {
  try {
    const { documentType, inputData, instructions } = req.body;
    const userId = req.user._id || req.user.id;

    if (!documentType) {
      return res.status(400).json({ success: false, error: 'Document type is required.' });
    }

    const draftResult = await generateLegalDraft({
      documentType,
      inputData: inputData || {},
      instructions: instructions || '',
      userApiKey: req.headers['x-gemini-api-key'] || null
    });

    const savedDraft = await repo.drafts.create({
      userId,
      documentType,
      title: draftResult.title || `${documentType} Draft`,
      inputData: inputData || {},
      generatedContent: draftResult.generatedContent,
      sections: draftResult.sections || [],
      status: 'generated'
    });

    // Also register in documents collection for unified management
    await repo.documents.create({
      userId,
      fileName: `${draftResult.title || documentType}.pdf`,
      fileType: 'application/pdf',
      fileSize: Buffer.byteLength(draftResult.generatedContent, 'utf8'),
      pageCount: Math.max(1, Math.ceil(draftResult.generatedContent.length / 2000)),
      rawText: draftResult.generatedContent,
      status: 'analyzed',
      category: 'Generated',
      isFavorite: false
    });

    res.json({
      success: true,
      draftId: savedDraft._id || savedDraft.id,
      draft: savedDraft,
      disclaimer: draftResult.disclaimer
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/drafts
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const drafts = await repo.drafts.find({ userId });
    res.json({ success: true, drafts });
  } catch (error) {
    next(error);
  }
});

// GET /api/drafts/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const draft = await repo.drafts.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ success: false, error: 'Draft not found.' });
    }
    res.json({ success: true, draft });
  } catch (error) {
    next(error);
  }
});

// PUT /api/drafts/:id
router.put('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { title, generatedContent, sections, status } = req.body;
    const update = {};
    if (title) update.title = title;
    if (generatedContent !== undefined) update.generatedContent = generatedContent;
    if (sections) update.sections = sections;
    if (status) update.status = status;

    const updated = await repo.drafts.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true, draft: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/drafts/:id
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    await repo.drafts.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Draft deleted.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/drafts/export/pdf
router.post('/export/pdf', optionalAuth, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required for export.' });
    }

    const docTitle = title || 'Legal Draft';
    const buffer = await generatePdfBuffer(docTitle, content);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${docTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

// POST /api/drafts/export/docx
router.post('/export/docx', optionalAuth, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required for export.' });
    }

    const docTitle = title || 'Legal Draft';
    const buffer = await generateDocxBuffer(docTitle, content);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${docTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.docx"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

// POST /api/drafts/export/txt
router.post('/export/txt', optionalAuth, async (req, res) => {
  const { title, content } = req.body;
  const docTitle = title || 'Legal Draft';
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${docTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt"`);
  res.send(content || '');
});

export default router;

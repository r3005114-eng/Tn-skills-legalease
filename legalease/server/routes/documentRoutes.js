import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { repo } from '../models/repository.js';
import { parseDocumentFile } from '../services/documentParser.js';
import { analyzeLegalDocument, summarizeDocument } from '../services/geminiService.js';
import { generatePdfBuffer, generateDocxBuffer } from '../services/documentGenerator.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// POST /api/documents/upload
router.post('/upload', optionalAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please select a legal document to upload (PDF, DOCX, TXT).' });
    }

    const userId = req.user._id || req.user.id;
    const { path: filePath, originalname: fileName, mimetype: fileType, size: fileSize } = req.file;

    // Parse file contents
    const parsed = await parseDocumentFile(filePath, fileType, fileName);

    const doc = await repo.documents.create({
      userId,
      fileName,
      fileType,
      fileSize,
      pageCount: parsed.pageCount,
      rawText: parsed.text,
      filePath,
      status: 'uploaded',
      category: 'Analyzed'
    });

    res.status(201).json({
      success: true,
      document: {
        id: doc._id || doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        pageCount: doc.pageCount,
        status: doc.status,
        characterCount: parsed.characterCount,
        wordCount: parsed.wordCount,
        previewText: parsed.text.slice(0, 500)
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/documents/analyze
router.post('/analyze', optionalAuth, async (req, res, next) => {
  try {
    const { documentId, rawText: suppliedText, fileName: suppliedName } = req.body;
    const userId = req.user._id || req.user.id;

    let targetDoc = null;
    let textToAnalyze = suppliedText;
    let fileName = suppliedName || 'Uploaded Legal Document';
    let fileType = 'application/pdf';

    if (documentId) {
      targetDoc = await repo.documents.findById(documentId);
      if (targetDoc) {
        textToAnalyze = targetDoc.rawText;
        fileName = targetDoc.fileName;
        fileType = targetDoc.fileType;
      }
    }

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Unable to analyze this document. The document appears to contain no extractable text.'
      });
    }

    // Call Gemini 3.8 Flash legal analyzer
    const analysisData = await analyzeLegalDocument({
      rawText: textToAnalyze,
      fileName,
      fileType,
      userApiKey: req.headers['x-gemini-api-key'] || null
    });

    // Save analysis record
    const savedAnalysis = await repo.documentAnalyses.create({
      documentId: targetDoc ? (targetDoc._id || targetDoc.id) : `doc_${Date.now()}`,
      userId,
      ...analysisData,
      createdAt: new Date()
    });

    if (targetDoc) {
      await repo.documents.findByIdAndUpdate(targetDoc._id || targetDoc.id, {
        status: 'analyzed',
        category: 'Analyzed'
      });
    }

    res.json({
      success: true,
      analysis: savedAnalysis,
      documentId: targetDoc ? (targetDoc._id || targetDoc.id) : null
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { category, search } = req.query;

    let docs = await repo.documents.find({ userId });

    if (category && category !== 'All') {
      docs = docs.filter(d => d.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d => (d.fileName && d.fileName.toLowerCase().includes(q)));
    }

    res.json({
      success: true,
      documents: docs.map(d => ({
        id: d._id || d.id,
        fileName: d.fileName,
        fileType: d.fileType,
        fileSize: d.fileSize,
        pageCount: d.pageCount,
        status: d.status,
        category: d.category,
        isFavorite: d.isFavorite,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const doc = await repo.documents.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const analysis = await repo.documentAnalyses.findOne({ documentId: req.params.id });

    res.json({
      success: true,
      document: doc,
      analysis
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/documents/:id (rename or favorite)
router.patch('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { fileName, isFavorite, category } = req.body;
    const update = {};
    if (fileName) update.fileName = fileName.trim();
    if (isFavorite !== undefined) update.isFavorite = isFavorite;
    if (category) update.category = category;

    const updated = await repo.documents.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true, document: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/documents/:id
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const doc = await repo.documents.findById(req.params.id);
    if (doc && doc.filePath) {
      try {
        await fs.unlink(doc.filePath);
      } catch (e) {
        // ignore missing file
      }
    }
    await repo.documents.findByIdAndDelete(req.params.id);
    await repo.documentAnalyses.deleteMany({ documentId: req.params.id });

    res.json({ success: true, message: 'Document and its analysis deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id/export?format=pdf|docx
router.get('/:id/export', optionalAuth, async (req, res, next) => {
  try {
    const format = req.query.format || 'pdf';
    const doc = await repo.documents.findById(req.params.id);
    const analysis = await repo.documentAnalyses.findOne({ documentId: req.params.id });

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'No analysis report found for this document.' });
    }

    const title = `Legal Analysis: ${doc ? doc.fileName : 'Document'}`;
    const reportContent = `
# EXECUTIVE LEGAL SUMMARY
${analysis.executiveSummary}

## DOCUMENT CLASSIFICATION
Type: ${analysis.documentType}

## CONTRACTING PARTIES
${(analysis.parties || []).map(p => `- ${p.role}: ${p.name} (${p.details || ''})`).join('\n')}

## CRITICAL DATES
${(analysis.importantDates || []).map(d => `- ${d.label}: ${d.date} (${d.significance || ''})`).join('\n')}

## FINANCIAL TERMS
${(analysis.financialTerms || []).map(f => `- ${f.label}: ${f.amount} (${f.frequency || ''} - ${f.details || ''})`).join('\n')}

## KEY OBLIGATIONS
${(analysis.obligations || []).map(o => `- [${o.priority}] ${o.party}: ${o.obligation}`).join('\n')}

## TERMINATION CONDITIONS
${(analysis.terminationConditions || []).map(t => `- Clause: ${t.clause} | Notice: ${t.noticePeriod} | Consequences: ${t.consequences}`).join('\n')}

## IMPORTANT CLAUSES EXPLAINED
${(analysis.importantClauses || []).map(c => `### ${c.title} [Attention: ${c.attentionLevel}]
Explanation: ${c.plainLanguageExplanation}
Why it matters: ${c.whyItMatters}
Reference: ${c.sourceReference || 'N/A'}`).join('\n\n')}

## POTENTIAL AREAS REQUIRING ATTENTION
${(analysis.attentionPoints || []).map(a => `### ${a.title} [${a.severity}]
${a.description}
Recommendation: ${a.recommendation}`).join('\n\n')}

## QUESTIONS TO ASK A QUALIFIED ADVOCATE
${(analysis.questionsForLawyer || []).map((q, idx) => `${idx + 1}. ${q}`).join('\n')}
`;

    if (format === 'docx') {
      const buffer = await generateDocxBuffer(title, reportContent);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${(doc ? doc.fileName : 'Analysis')}-Report.docx"`);
      return res.send(buffer);
    }

    const buffer = await generatePdfBuffer(title, reportContent);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(doc ? doc.fileName : 'Analysis')}-Report.pdf"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

export default router;

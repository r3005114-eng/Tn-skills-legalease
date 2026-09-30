import express from 'express';
import { repo } from '../models/repository.js';
import { verifiedLegalArticles } from '../data/seedLegalData.js';

const router = express.Router();

// GET /api/library
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let articles = await repo.legalArticles.find();
    if (!articles || articles.length === 0) {
      // Seed dynamically if empty
      for (const item of verifiedLegalArticles) {
        await repo.legalArticles.create(item);
      }
      articles = await repo.legalArticles.find();
    }

    if (category && category !== 'All') {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.shortExplanation.toLowerCase().includes(q) ||
        (a.statute && a.statute.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      categories: [
        'All',
        'Contracts',
        'Employment',
        'Rental',
        'Consumer Rights',
        'Cyber Law',
        'General Legal Concepts'
      ],
      articles: articles.map(a => ({
        id: a._id || a.id,
        title: a.title,
        category: a.category,
        shortExplanation: a.shortExplanation,
        statute: a.statute,
        relevantSections: a.relevantSections || [],
        source: a.source,
        sourceUrl: a.sourceUrl,
        lastUpdated: a.lastUpdated,
        fullContent: a.fullContent
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/library/:id
router.get('/:id', async (req, res, next) => {
  try {
    const article = await repo.legalArticles.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found.' });
    }
    res.json({ success: true, article });
  } catch (error) {
    next(error);
  }
});

export default router;

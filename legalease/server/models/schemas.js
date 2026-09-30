import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'legal_professional' },
  organization: { type: String, default: 'Independent Legal Counsel' },
  jurisdiction: { type: String, default: 'India (Central & State)' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  structuredResponse: {
    answer: String,
    keyPoints: [String],
    relevantContext: String,
    considerations: [String],
    nextSteps: [String],
    sources: [{
      title: String,
      authority: String,
      relevantSection: String,
      link: String
    }],
    verificationNote: String
  },
  attachments: [{
    fileName: String,
    fileType: String,
    fileSize: Number
  }],
  feedback: { type: String, enum: ['up', 'down', null], default: null },
  createdAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  messages: [messageSchema],
  hasAttachments: { type: Boolean, default: false },
  lastMessage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  pageCount: { type: Number, default: 1 },
  rawText: { type: String, default: '' },
  filePath: { type: String, default: '' },
  status: { type: String, enum: ['uploaded', 'analyzing', 'analyzed', 'error'], default: 'uploaded' },
  category: { type: String, default: 'Drafts' },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const documentAnalysisSchema = new mongoose.Schema({
  documentId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  documentType: { type: String, required: true },
  executiveSummary: { type: String, required: true },
  parties: [{
    name: String,
    role: String,
    details: String
  }],
  importantDates: [{
    label: String,
    date: String,
    significance: String
  }],
  financialTerms: [{
    label: String,
    amount: String,
    frequency: String,
    details: String
  }],
  obligations: [{
    party: String,
    obligation: String,
    priority: { type: String, enum: ['High', 'Medium', 'Standard'] }
  }],
  terminationConditions: [{
    clause: String,
    noticePeriod: String,
    curePeriod: String,
    consequences: String
  }],
  importantClauses: [{
    title: String,
    plainLanguageExplanation: String,
    whyItMatters: String,
    attentionLevel: { type: String, enum: ['Informational', 'Review recommended', 'Important to verify'], default: 'Informational' },
    sourceReference: String
  }],
  attentionPoints: [{
    title: String,
    description: String,
    severity: { type: String, enum: ['Informational', 'Review recommended', 'Important to verify'] },
    recommendation: String
  }],
  questionsForLawyer: [String],
  createdAt: { type: Date, default: Date.now }
});

const draftSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  documentType: { type: String, required: true },
  title: { type: String, required: true },
  inputData: { type: Object, default: {} },
  generatedContent: { type: String, required: true },
  sections: [{
    title: String,
    content: String
  }],
  status: { type: String, default: 'draft' },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const legalArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  shortExplanation: { type: String, required: true },
  fullContent: { type: String, required: true },
  statute: { type: String, required: true },
  relevantSections: [String],
  jurisdiction: { type: String, default: 'India' },
  source: { type: String, required: true },
  sourceUrl: { type: String, default: '' },
  lastUpdated: { type: String, default: '2026-03' }
});

export const User = mongoose.model('User', userSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);
export const Document = mongoose.model('Document', documentSchema);
export const DocumentAnalysis = mongoose.model('DocumentAnalysis', documentAnalysisSchema);
export const Draft = mongoose.model('Draft', draftSchema);
export const LegalArticle = mongoose.model('LegalArticle', legalArticleSchema);

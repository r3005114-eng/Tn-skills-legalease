import { getIsMongooseConnected } from '../config/db.js';
import { memoryDb } from './memoryStore.js';
import { User, Conversation, Document, DocumentAnalysis, Draft, LegalArticle } from './schemas.js';

function createRepo(Model, memCollection) {
  return {
    async find(query = {}) {
      if (getIsMongooseConnected()) {
        return await Model.find(query).sort({ createdAt: -1 }).lean();
      }
      return await memCollection.find(query);
    },
    async findOne(query = {}) {
      if (getIsMongooseConnected()) {
        return await Model.findOne(query).lean();
      }
      return await memCollection.findOne(query);
    },
    async findById(id) {
      if (getIsMongooseConnected()) {
        return await Model.findById(id).lean();
      }
      return await memCollection.findById(id);
    },
    async create(data) {
      if (getIsMongooseConnected()) {
        const item = new Model(data);
        const saved = await item.save();
        return saved.toObject ? saved.toObject() : saved;
      }
      return await memCollection.create(data);
    },
    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (getIsMongooseConnected()) {
        return await Model.findByIdAndUpdate(id, update, { ...options, lean: true });
      }
      return await memCollection.findByIdAndUpdate(id, update, options);
    },
    async findByIdAndDelete(id) {
      if (getIsMongooseConnected()) {
        return await Model.findByIdAndDelete(id).lean();
      }
      return await memCollection.findByIdAndDelete(id);
    },
    async countDocuments(query = {}) {
      if (getIsMongooseConnected()) {
        return await Model.countDocuments(query);
      }
      return await memCollection.countDocuments(query);
    },
    async deleteMany(query = {}) {
      if (getIsMongooseConnected()) {
        return await Model.deleteMany(query);
      }
      return await memCollection.deleteMany(query);
    }
  };
}

export const repo = {
  users: createRepo(User, memoryDb.users),
  conversations: createRepo(Conversation, memoryDb.conversations),
  documents: createRepo(Document, memoryDb.documents),
  documentAnalyses: createRepo(DocumentAnalysis, memoryDb.documentAnalyses),
  drafts: createRepo(Draft, memoryDb.drafts),
  legalArticles: createRepo(LegalArticle, memoryDb.legalArticles),
};

import crypto from 'crypto';

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.items = new Map();
  }

  async find(query = {}) {
    let result = Array.from(this.items.values());
    for (const [key, value] of Object.entries(query)) {
      result = result.filter(item => {
        if (value && typeof value === 'object' && value.$in) {
          return value.$in.includes(item[key]);
        }
        return item[key] === value;
      });
    }
    // Return copies sorted by createdAt desc by default
    return result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(i => ({ ...i }));
  }

  async findOne(query = {}) {
    const list = await this.find(query);
    return list.length > 0 ? { ...list[0] } : null;
  }

  async findById(id) {
    const item = this.items.get(String(id));
    return item ? { ...item } : null;
  }

  async create(data) {
    const _id = data._id || crypto.randomUUID();
    const now = new Date();
    const item = {
      ...data,
      _id: String(_id),
      id: String(_id),
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    this.items.set(String(_id), item);
    return { ...item };
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const existing = this.items.get(String(id));
    if (!existing) return null;
    const now = new Date();
    const updated = {
      ...existing,
      ...(update.$set || update),
      updatedAt: now,
    };
    this.items.set(String(id), updated);
    return { ...updated };
  }

  async findByIdAndDelete(id) {
    const existing = this.items.get(String(id));
    if (!existing) return null;
    this.items.delete(String(id));
    return { ...existing };
  }

  async deleteMany(query = {}) {
    const matches = await this.find(query);
    for (const match of matches) {
      this.items.delete(String(match._id));
    }
    return { deletedCount: matches.length };
  }

  async countDocuments(query = {}) {
    const list = await this.find(query);
    return list.length;
  }
}

export const memoryDb = {
  users: new MemoryCollection('users'),
  conversations: new MemoryCollection('conversations'),
  documents: new MemoryCollection('documents'),
  documentAnalyses: new MemoryCollection('documentAnalyses'),
  drafts: new MemoryCollection('drafts'),
  legalArticles: new MemoryCollection('legalArticles'),
};

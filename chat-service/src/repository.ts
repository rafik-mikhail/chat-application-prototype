import { Document, Model } from 'mongoose';

export abstract class Repository<T extends Document> {
  constructor(private readonly model: Model<T>) {}
  async create(doc: object): Promise<T> {
    const createdEntity = new this.model(doc);
    const savedResult = await createdEntity.save();

    return savedResult;
  }

  async findOne(partialDoc: object): Promise<T> {
    return await this.model.findOne(partialDoc);
  }

  async find(partialDoc: object): Promise<T[]> {
    return await this.model.find(partialDoc);
  }

  async save(partialDoc: T) {
    return await partialDoc.save();
  }
}

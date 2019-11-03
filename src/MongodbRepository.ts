import { Collection, ObjectId } from 'mongodb'
import { Entity } from './structures/interfaces/Entity'
import { PaginatedQueryResult } from './structures/interfaces/PaginatedQueryResult'

export abstract class MongodbRepository<TEntity extends Entity> {
  constructor (protected readonly collection: Collection) { }

  protected async findOneBy (query: Record<string, any>): Promise<TEntity | null> {
    return this.collection.find<TEntity>(query)
      .limit(1)
      .toArray()
      .then(([result]) => result)
      .then((result) => result || null)
  }

  protected async unpaginatedSearch (query: Record<string, any>): Promise<TEntity[]> {
    return this.collection.find<TEntity>(query)
      .toArray()
  }

  protected async existsBy (query: Record<string, any>): Promise<boolean> {
    return this.collection.countDocuments(query)
      .then((count: number) => count > 0)
  }

  private async update (entity: TEntity): Promise<TEntity> {
    const { _id, ...payload } = entity
    await this.collection.updateOne({ _id }, { $set: payload })

    return entity
  }

  protected async create (entity: TEntity) {
    await this.collection.insertOne(entity)

    return entity
  }

  protected async runPaginatedQuery (query: Record<string, any>, page = 0, size = 10): Promise<PaginatedQueryResult<TEntity>> {
    const total = await this.collection.countDocuments(query)
    const from = page * size

    if (total === 0) {
      return { total: 0, count: 0, results: [], range: { from: 0, to: 0 } }
    }

    const results = await this.collection.find<TEntity>(query)
      .skip(from)
      .limit(size)
      .toArray()

    const to = from + results.length

    return { total, count: results.length, results, range: { from, to } }
  }

  public async deleteById (id: ObjectId | string): Promise<boolean | null> {
    if (!ObjectId.isValid(id)) return null

    const result = await this.collection.deleteOne({ _id: new ObjectId(id) })

    return !!result.result.ok
  }

  protected async deleteBy (query: any): Promise<boolean> {
    const { result } = await this.collection.deleteMany(query)

    return !!result.ok
  }

  public async findById (id: ObjectId | string): Promise<TEntity | null> {
    if (!ObjectId.isValid(id)) return null

    return this.findOneBy({ _id: new ObjectId(id) })
  }

  public async existsById (id: ObjectId | string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false

    return this.existsBy({ _id: new ObjectId(id) })
  }

  public async save (entity: TEntity) {
    if (await this.existsById(entity._id)) {
      return this.update(entity)
    }

    return this.create(entity)
  }
}

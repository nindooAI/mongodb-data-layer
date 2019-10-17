import { Collection, ObjectId } from 'mongodb'
import { Entity } from './structures/interfaces/Entity'
import { SerializedEntity } from './structures/interfaces/SerializedEntity'
import { PaginatedQueryResult } from './structures/interfaces/PaginatedQueryResult'

export abstract class MongodbRepository<TEntity extends Entity, TSerializedEntity extends SerializedEntity> {
  constructor (protected readonly collection: Collection) { }

  abstract serialize (entity: TEntity): TSerializedEntity
  abstract deserialize (data: TSerializedEntity): TEntity

  protected async findOneBy (query: Record<string, any>): Promise<TEntity | null> {
    return this.collection.find(query)
      .limit(1)
      .toArray()
      .then(([result]: any[]) => result)
      .then((result: any) => result ? this.deserialize(result) : null)
  }

  protected async existsBy (query: Record<string, any>): Promise<boolean> {
    return this.collection.countDocuments(query)
      .then((count: number) => count > 0)
  }

  private async update (entity: TEntity) {
    const payload = this.serialize(entity)

    await this.collection.updateOne({ _id: entity.id }, { $set: payload })

    return entity
  }

  protected async create (entity: TEntity) {
    const payload = this.serialize(entity)

    await this.collection.insertOne(payload)

    return entity
  }

  protected async runPaginatedQuery (query: Record<string, any>, page = 0, size = 10): Promise<PaginatedQueryResult<TEntity>> {
    const total = await this.collection.countDocuments(query)
    const from = page * size

    if (total === 0) {
      return { total: 0, count: 0, results: [], range: { from: 0, to: 0 } }
    }

    const results = await this.collection.find(query)
      .skip(from)
      .limit(size)
      .toArray()
      .then((results: any) => results.map(this.deserialize))

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
    if (await this.existsById(entity.id)) {
      return this.update(entity)
    }

    return this.create(entity)
  }
}

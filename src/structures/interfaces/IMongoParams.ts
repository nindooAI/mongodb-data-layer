import { MongoClientOptions } from 'mongodb'

export interface IMongoParams {
  uri: string,
  dbName: string,
  options?: MongoClientOptions,
  maximumConnectionAttempts?: number
}

import { MongoClient, Db } from 'mongodb'
import { ConnectionError } from './errors/ConnectionError'
import { IMongoParams } from '../structures/interfaces/IMongoParams'

/**
 * MongoClient default settings
 */
const defaults = {
  poolSize: 10,
  useNewUrlParser: true
}

/**
 * Connect to a MongoDB database
 *
 * @param {Object} mongoData Data to connect to the database
 * @param {string} mongoData.uri Host IP or mongodb:// URL to connect
 * @param {string} mongoData.dbname Database name
 * @param {MongoClientOptions} mongoData.options Options to be proxied to the database
 */
async function connect ({ uri, dbName, maximumConnectionAttempts, options = {} }: IMongoParams, attemptsMade = 0): Promise<Db> {
  try {
    const client = await MongoClient.connect(uri, { ...defaults, ...options })
    return client.db(dbName)
  } catch (err) {
    if (attemptsMade >= maximumConnectionAttempts) throw new ConnectionError(`Mongodb connection failed after ${attemptsMade} attempts with message: ${err.message}`)
    return connect({ uri, dbName, maximumConnectionAttempts, options }, attemptsMade + 1)
  }
}

/**
 * Creates a mongoDB Connection
 *
 * @param databaseEnvs {Object} Environment variables for database
 * @param databaseEnvs.mongodb {IMongoParams} Environment variables for mongoDB
 */
export async function createConnection (config: IMongoParams): Promise<Db> {
  return connect(config)
}

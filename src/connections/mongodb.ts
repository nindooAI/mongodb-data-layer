import { MongoClient, Db, MongoClientOptions } from 'mongodb'
import { ConnectionError } from './errors/ConnectionError'
import { IMongoParams } from '../structures/interfaces/IMongoParams'

/**
 * MongoClient default settings
 */
const defaults: MongoClientOptions = {
  poolSize: 10,
  useNewUrlParser: true,
  useUnifiedTopology: true
}

/**
 * Connect to a MongoDB database
 *
 * @param {Object} mongoData Data to connect to the database
 * @param {string} mongoData.uri Host IP or mongodb:// URL to connect
 * @param {string} mongoData.dbname Database name
 * @param {MongoClientOptions} mongoData.options Options to be proxied to the database
 */
async function connect ({ uri, dbName, maximumConnectionAttempts = 5, options = {} }: IMongoParams, attemptsMade = 0): Promise<MongoClient> {
  try {
    const client = await MongoClient.connect(uri, { ...defaults, ...options })
    return client
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
  const client = await connect(config)
  return client.db(config.dbName)
}

/**
 * Creates a mongoDB Client
 *
 * @param databaseEnvs {Object} Environment variables for database
 * @param databaseEnvs.mongodb {IMongoParams} Environment variables for mongoDB
 */
export async function createClient (config: IMongoParams): Promise<MongoClient> {
  const client = await connect(config)
  return client
}

import { MongodbRepository } from './MongodbRepository'
import { createConnection } from './connections/mongodb'
import { ConnectionError } from './connections/errors/ConnectionError'

// Repository
export * from './MongodbRepository'

// Interfaces
export * from './structures/interfaces/Entity'
export * from './structures/interfaces/IMongoParams'
export * from './structures/interfaces/SerializedEntity'
export * from './structures/interfaces/PaginatedQueryResult'

// Connection
export * from './connections/mongodb'
export * from './connections/errors/ConnectionError'

const lib = {
  MongodbRepository,
  createConnection,
  ConnectionError
}

export default lib
module.exports = lib

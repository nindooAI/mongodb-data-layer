Mongodb Data Layer
===

This is a simple yet (hopefully) useful set of tools to aid working with mongodb.

- [Mongodb Data Layer](#mongodb-data-layer)
- [Usage](#usage)
  - [Mongodb connection factory](#mongodb-connection-factory)
    - [IMongoParams](#imongoparams)
    - [createConnection(config: IMongoParams): Promise<Db>](#createconnectionconfig-imongoparams-promisedb)
    - [createClient(config: IMongoParams): Promise<MongoClient>](#createclientconfig-imongoparams-promisemongoclient)
  - [MongodbRepository](#mongodbrepository)
    - [Instantiation](#instantiation)
    - [Protected methods](#protected-methods)
      - [protected findOneBy(query: Record<string, any>): Promise<TEntity | null>](#protected-findonebyquery-recordstring-any-promisetentity--null)
      - [protected unpaginatedSearch(query: Record<string, any>): Promise<TEntity[]>](#protected-unpaginatedsearchquery-recordstring-any-promisetentity)
      - [protected existsBy(query: Record<string, any>): Promise<boolean>](#protected-existsbyquery-recordstring-any-promiseboolean)
      - [protected runPaginatedQuery(query: Record<string, any>, page?: number, size?: number): Promise<PaginatedQueryResult<TEntity>>](#protected-runpaginatedqueryquery-recordstring-any-page-number-size-number-promisepaginatedqueryresulttentity)
      - [protected deleteBy(query: any): Promise<boolean>](#protected-deletebyquery-any-promiseboolean)
    - [Public methods](#public-methods)
      - [deleteById(id: ObjectId | string): Promise<boolean | null>](#deletebyidid-objectid--string-promiseboolean--null)
      - [findById(id: ObjectId | string): Promise<TEntity | null>](#findbyidid-objectid--string-promisetentity--null)
      - [existsById(id: ObjectId | string): Promise<boolean>](#existsbyidid-objectid--string-promiseboolean)
      - [save(entity: TEntity): Promise<TEntity>](#saveentity-tentity-promisetentity)
  - [Contributing](#contributing)

# Usage

Currently there are two main functionallities:

## Mongodb connection factory

Utility functions that receive a fiven configuration and return a promise resolving to either a mongodb `Db`, or the `MongoClient` instance itself. These functions are detailed below.

Both functions accept a `IMongoParams` interface, which is as follows:

### IMongoParams

```typescript
interface IMongoParams {
    uri: string; // Mongodb full URI including schema
    dbName: string; // Name of the desired database
    options?: MongoClientOptions; // Passthrough options for MongoClient's `connect` method
    maximumConnectionAttempts?: number; // Number of connection attempts to make before throwing a `ConnectionError`
}
```

### createConnection(config: IMongoParams): Promise<Db>

This receives the connection params and resolves to an instance of mongodb's `Db`.

Example:
```typescript
import mongodb, { IMongoParams } from '@nindoo/mongodb-data-layer'

const mongodbParams: IMongoParams = {
  uri: 'mongodb://localhost:27017',
  dbName: 'my-database'
}

mongodb.createConnection(mongodbParams)
  .then(db => {
    const collection = db.collection('users')

    collection.findOne({ username: 'rjmunhoz' })
      .then(user => {
        if (!user) throw new Error('User not found!')

        console.log('Found user rjmunhoz')
      })
  })
```

### createClient(config: IMongoParams): Promise<MongoClient>

Same as [createConnection](#createconnectionconfig-imongoparams-promisedb), but resolves to a `MongoClient` instead

Example:
```typescript
import mongodb, { IMongoParams } from '@nindoo/mongodb-data-layer'

const mongodbParams: IMongoParams = {
  uri: 'mongodb://localhost:27017',
  dbName: 'my-database'
}

mongodb.createClient(mongodbParams)
  .then(mongoClient => {
    const db = mongoClient.db('my-database')
    const collection = db.collection('users')

    collection.findOne({ username: 'rjmunhoz' })
      .then(user => {
        if (!user) throw new Error('User not found!')

        console.log('Found user rjmunhoz')
        db.close() // this is why we actually implemented `createClient`
      })
  })
```

## MongodbRepository

This is a class which implements common and, usually, repetitive functionallity.

### Instantiation

`MongodbRepository` is an abstract class and, as so, you cannot instantiate it directly; it mus be extended.
This is because you have to provide your own entity type like so:

```typescript
import { Db } from 'mongodb'
import { Profile } from '../../domain/profile/Profile'
import { MongodbRepository } from '@nindoo/mongodb-data-layer'

export class ProfileRepository extends MongodbRepository<Profile> {
  constructor (connection: Db) {
    super(connection.collection('profiles'))
  }
}
```

### Protected methods

These methods are available for your repository to use, but are generally too generic to be used outside the data layer (aka they require queries and database-only stuff)

#### protected findOneBy(query: Record<string, any>): Promise<TEntity | null>

Receives a query object, runs it and resolves to its result

#### protected unpaginatedSearch(query: Record<string, any>): Promise<TEntity[]>

Runs the given query and resolves to its results without applying pagination

#### protected existsBy(query: Record<string, any>): Promise<boolean>

Runs the given query resolving to `true` if a result was found and to `false` otherwise.

> This simply counts the amount of documents found by the query, without fetching any of them.

#### protected runPaginatedQuery(query: Record<string, any>, page?: number, size?: number): Promise<PaginatedQueryResult<TEntity>>

Runs the given query and resolves to its results paginated.

The `PaginatedQueryResult<TEntity>` is as follows

```typescript
interface PaginatedQueryResult<TEntity> {
    count: number; // amount of results returned by this call
    total: number; /// total amount of documents found by query
    range: {
        from: number; // number of the first result
        to: number; // number of the last result
    };
    results: TEntity[]; // array of results
}
```

#### protected deleteBy(query: any): Promise<boolean>

Deletes any documents matched by the given query and resolves to a boolean indicating success

### Public methods

These methods are simple enough to be database agnostic and, thus, can be used directly by other layers.

#### deleteById(id: ObjectId | string): Promise<boolean | null>

Deletes a document given its ID and resolves to a boolean indicating success

#### findById(id: ObjectId | string): Promise<TEntity | null>

Finds a document by its ID and resolved to an instance of `TEntity`, if one was found, or to `null` otherwise

#### existsById(id: ObjectId | string): Promise<boolean>

Resolved to a boolean indicating wether a given document exists or not, based on its ID

> This uses [existsBy](#protected-existsbyquery-recordstring-any-promiseboolean) under the hood

#### save(entity: TEntity): Promise<TEntity>

Upserts an entity to the database and resolves to the same input entity

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

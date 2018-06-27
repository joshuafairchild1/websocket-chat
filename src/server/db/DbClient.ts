'use strict'

import { Db, MongoClient } from 'mongodb'
import { logger } from '../../shared/utils'

const log = logger('DbConnection')

// TODO worry about closing the connection
class DbClient {
  async connect(dbName: string) {
    try {
      const db = await new Promise<Db>((resolve, reject) =>
        MongoClient.connect(`mongodb://localhost:27017/${dbName}`,
          (ex, client) => ex ? reject(ex) : resolve(client.db(dbName))))
      log.info('opened new database connection')
      return db
    } catch (ex) {
      log.error('exception opening database connection', ex)
    }
  }
}

export default new DbClient()
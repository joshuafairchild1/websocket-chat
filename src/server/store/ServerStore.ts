'use strict'

import DbClient from '../db/DbClient'
import { Collection } from 'mongodb'

export default class ServerStore {

  protected collection: Collection

  constructor(
    private collectionName: string,
    private dbName: string = 'ws-chat'
  ) {}

  async initializeCollection <T extends ServerStore> (): Promise<T> {
    this.collection = (await DbClient.connect(this.dbName))
      .collection(this.collectionName)
    return this as any as T
  }

  async clear() {
    await this.collection.deleteMany({})
  }

}
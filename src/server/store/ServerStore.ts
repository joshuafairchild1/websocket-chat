'use strict'

import DbClient from '../db/DbClient'
import { Collection } from 'mongodb'

export default class ServerStore {

  protected collection: Collection

  constructor(private collectionName: string) {}

  async initializeCollection(): Promise<ServerStore> {
    this.collection = (await DbClient.connect()).collection(this.collectionName)
    return this
  }

}
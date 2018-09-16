'use strict'

import ServerStore from './ServerStore'
import Room from '../../shared/model/Room'
import { logger } from '../../shared/utils'
import { ObjectId } from 'mongodb'

const log = logger('RoomStore')
const idQuery = (value: string) => ({ _id: new ObjectId(value) })

export default class RoomStore extends ServerStore {

  constructor(dbName?: string) {
    super('room', dbName)
  }

  async create(room: Room): Promise<Room> {
    const copy = { ...room }
    delete copy.messages
    const { insertedId } = await this.collection.insertOne(copy)
    log.info('created new room', insertedId)
    return new Room(copy.name).withId(insertedId.toString())
  }

  async getAll(): Promise<Room[]> {
    return this.collection.find({}).toArray()
  }

  async hasName(name: string): Promise<Boolean> {
    return !!(await this.collection.findOne({ name }))
  }

  async get(roomId: string): Promise<Room | null> {
    return await this.collection.findOne(idQuery(roomId))
  }

}
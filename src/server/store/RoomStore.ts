'use strict'

import ServerStore from './ServerStore'
import Room from '../../shared/model/Room'
import { logger } from '../../shared/utils'
import { ObjectId } from 'mongodb'

const log = logger('RoomStore')

// TODO: real error handling???

export default class RoomStore extends ServerStore {
  constructor() {
    super('room')
  }

  async create(room: Room): Promise<Room> {
    const { insertedId } = await this.collection.insertOne(room)
    log('created new room', insertedId)
    return room.withId(insertedId.toString())
  }

  async getAll(): Promise<Room[]> {
    return this.collection.find({}).toArray()
  }

  async hasName(name: string): Promise<Boolean> {
    return !!(await this.collection.findOne({ name }))
  }

  async hasId(roomId: string): Promise<Boolean> {
    return !!(await this.collection.findOne({ _id: new ObjectId(roomId) }))
  }

  // async get(roomId: string): Promise<Room | null> {
  //   return await this.collection.findOne({ _id: roomId })
  // }

}
'use strict'

import ServerStore from './ServerStore'
import Room from '../../shared/model/Room'
import { logger } from '../../shared/utils'
import { ObjectId } from 'mongodb'
import ChatMessage from '../../shared/model/ChatMessage'

const log = logger('RoomStore')
const idQuery = (value: string) => ({ _id: new ObjectId(value) })

export default class RoomStore extends ServerStore {
  constructor() {
    super('room')
  }

  async create(room: Room): Promise<Room> {
    const { insertedId } = await this.collection.insertOne(room)
    log.info('created new room', insertedId)
    return room.withId(insertedId.toString())
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

  async addMessage(roomId: string, message: ChatMessage) {
    await this.collection
      .updateOne(idQuery(roomId), { $push: { 'messages': message } })
  }

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    const room = await this.get(roomId)
    const { messages = null } = room || {}
    return messages || []
  }

  async updateMessages(roomId: string, clientId: string, name: any) {
    const room = await this.get(roomId)
    room.messages.forEach(message =>
      message.senderId === clientId && (message.senderName = name))
    await this.collection.updateOne(idQuery(roomId), { $set: room })
  }

}
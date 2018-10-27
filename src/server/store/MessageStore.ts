'use strict'

import ServerStore from './ServerStore'
import ChatMessage from '../../shared/model/ChatMessage'

export default class MessageStore extends ServerStore {

  constructor(dbName?: string) {
    super('message', dbName)
  }

  async addMessage(roomId: string, message: ChatMessage): Promise<void> {
    await this.collection.insertOne({ ...message, roomId })
  }

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    return await this.collection.find<ChatMessage>({ roomId }).toArray()
  }

  async updateMessages(roomId: string, senderName: string): Promise<void> {
    await this.collection.updateMany({ roomId }, { $set: { senderName } })
  }

}
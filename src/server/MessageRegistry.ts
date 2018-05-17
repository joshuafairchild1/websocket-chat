'use strict'

import { logger} from '../shared/utils'
import ChatMessage from '../shared/model/ChatMessage'

const log = logger('MessageRegistry')

export default class MessageRegistry {

  private readonly messages: ChatMessage[] = []

  add(message: ChatMessage) {
    const { messages } = this
    messages.push(message)
    log(`${messages.length} messages total`)
  }

  getAll(): ChatMessage[] {
    return this.messages
  }

  updateNameFor(clientId: string, name: string) {
    this.messages.forEach((message: ChatMessage) => {
      if (message.senderId === clientId) {
        message.senderName = name
      }
    })
  }
}
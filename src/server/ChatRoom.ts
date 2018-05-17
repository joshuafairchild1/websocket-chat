'use strict'

import { logger } from '../shared/utils'
import ChatMessage from '../shared/model/ChatMessage'
import MessageRegistry from './MessageRegistry'
import User from '../shared/model/User'
import { connection } from 'websocket'

const log = logger('ChatRoom')

export default class ChatRoom {

  private readonly clients: Map<string, User> = new Map()

  constructor(private messages: MessageRegistry) {}

  addMessage(message: ChatMessage) {
    this.messages.add(message)
  }

  newUser(connection: connection): User {
    const user = new User(connection)
    const { clientId } = user
    this.clients.set(clientId, user)
    return user
  }

  userLeft(clientId: string): User {
    const user = this.clients.get(clientId)
    if (!user) {
      log('could not locate user who disconnected', clientId)
      return
    }
    this.clients.delete(clientId)
    log('client', clientId, 'disconnected',
      this.clients.size, 'connections remaining')
    return user
  }

  forEachUser(fn: (user: User) => void) {
    this.clients.forEach(fn)
  }

  getMessages(): ChatMessage[] {
    return this.messages.getAll()
  }

  newUsername(clientId: string, name: string) {
    const user = this.clients.get(clientId)
    if (!user) {
      throw Error('could not locate user ' + clientId)
    }
    user.name = name
    this.updateMessages(clientId, name)
  }

  private updateMessages(clientId: string, name: string) {
    this.messages.updateNameFor(clientId, name)
  }

}
'use strict'

import { logger } from '../../shared/utils'
import ChatMessage from '../../shared/model/ChatMessage'
import MessageRegistry from '../messaging/MessageRegistry'
import User from '../../shared/model/User'
import { connection } from 'websocket'
import { EventEmitter } from 'events'
import { Closeable } from '../../shared/Types'


export default class RoomChannel extends EventEmitter implements Closeable {

  readonly [index:string]: any
  private readonly clients: Map<string, User> = new Map()
  private log = logger(`RoomChannel-${this.roomId}`)
  isActive = true

  constructor(private roomId: string, private messages: MessageRegistry) {
    super()
  }

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
    const { clients } = this
    const user = this.getUser(clientId)
    clients.delete(clientId)
    this.log('client', clientId, 'disconnected from room', this.roomId,
      clients.size, 'participants remaining')
    if (clients.size === 0) {
      this.log(`no more participants in room ${this.roomId}`,
        'shutting down channel')
      this.close()
    }
    return user
  }

  forEachUser(fn: (user: User) => void) {
    this.clients.forEach(fn)
  }

  getMessages(): ChatMessage[] {
    return this.messages.getAll()
  }

  getUser(clientId: string) {
    const user = this.clients.get(clientId)
    if (!user) {
      throw Error('could not locate user ' + clientId)
    }
    return user
  }

  newUsername(clientId: string, name: string) {
    const user = this.getUser(clientId)
    user.name = name
    this.updateMessages(clientId, name)
  }

  close() {
    this.log(`emitting "close" event on channel for room ${this.roomId}`)
    this.emit('close')
    this.isActive = false
  }

  private updateMessages(clientId: string, name: string) {
    this.messages.updateNameFor(clientId, name)
  }

}
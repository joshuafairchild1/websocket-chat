'use strict'

import { logger } from '../shared/utils'
import ChatMessage from '../shared/model/ChatMessage'
import MessageRegistry from './MessageRegistry'
import User from '../shared/model/User'
import { connection } from 'websocket'
import { EventEmitter } from 'events'
import { Closeable } from '../shared/Types'

const log = logger('RoomChannel')

export default class RoomChannel extends EventEmitter implements Closeable {

  readonly [index:string]: any
  private readonly clients: Map<string, User> = new Map()
  isActive = true

  constructor(private roomId: string, private messages: MessageRegistry
  ) {
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
    const user = clients.get(clientId)
    if (!user) {
      log('could not locate user who disconnected', clientId)
      return
    }
    clients.delete(clientId)
    log('client', clientId, 'disconnected', clients.size, 'connections remaining')
    if (clients.size === 0) {
      log('no more participants in room', this.roomId, ', shutting down channel')
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

  close() {
    log(`emitting "close" event on channel for room ${this.roomId}`)
    this.emit('close')
    this.isActive = false
  }

}
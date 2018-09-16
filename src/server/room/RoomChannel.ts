'use strict'

import { logger } from '../../shared/utils'
import User from '../../shared/model/User'
import { connection } from 'websocket'
import { EventEmitter } from 'events'
import { Closeable } from '../../shared/Types'

export default class RoomChannel extends EventEmitter implements Closeable {

  private readonly users: Map<string, User> = new Map()
  private log = logger(`RoomChannel-${this.roomId}`)
  isActive = false

  constructor(private roomId: string,) {
    super()
  }

  newUser(connection: connection): User {
    if (!this.isActive) {
      this.isActive = true
    }
    const user = new User(connection)
    const { clientId } = user
    this.users.set(clientId, user)
    return user
  }

  userLeft(clientId: string): User {
    const { users } = this
    const user = this.getUser(clientId)
    users.delete(clientId)
    this.log.info('client', clientId, 'disconnected from room', this.roomId,
      users.size, 'participants remaining')
    if (users.size === 0) {
      this.log.info(`no more participants in room ${this.roomId}`,
        'shutting down channel')
      this.close()
    }
    return user
  }

  forEachUser(fn: (user: User) => void) {
    this.users.forEach(fn)
  }

  getUser(clientId: string): User {
    const user = this.users.get(clientId)
    if (!user) {
      throw Error('could not locate user ' + clientId)
    }
    return user
  }

  newUsername(clientId: string, newName: string) {
    this.getUser(clientId).name = newName
  }

  close() {
    this.log.info(`emitting "close" event on channel for room ${this.roomId}`)
    this.emit('close')
    this.isActive = false
  }

}
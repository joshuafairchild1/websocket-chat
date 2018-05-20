'use strict'

import { logger} from '../shared/utils'
import RoomChannel from './RoomChannel'
import MessageRegistry from './MessageRegistry'

const log = logger('RoomChannelRegistry')

export default class RoomChannelRegistry {

  private readonly channels: Map<string, RoomChannel> = new Map()

  get(id: string): RoomChannel {
    const channel = this.channels.get(id)
    if (!channel) {
      throw Error('no channel for room ' + id)
    }
    return channel
  }

  ensureChannelFor(roomId: string): RoomChannel {
    const existing = this.channels.get(roomId)
    if (existing) {
      log('found existing room channel for room', roomId)
      return existing
    }
    log('creating new room channel for room', roomId)
    return this.create(roomId)
  }

  private create(roomId: string): RoomChannel {
    const channel = new RoomChannel(roomId, new MessageRegistry())
    channel.on('close', () => {
      log('closing room channel for room', roomId)
      this.channels.delete(roomId)
    })
    this.channels.set(roomId, channel)
    return channel
  }

}
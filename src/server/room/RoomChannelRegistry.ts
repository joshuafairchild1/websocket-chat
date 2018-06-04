'use strict'

import { logger} from '../../shared/utils'
import RoomChannel from './RoomChannel'

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
      log.info('found existing room channel for room', roomId)
      return existing
    }
    log.info('creating new room channel for room', roomId)
    return this.create(roomId)
  }

  private create(roomId: string): RoomChannel {
    const channel = new RoomChannel(roomId)
    channel.on('close', () => {
      log.info('closing room channel for room', roomId)
      this.channels.delete(roomId)
    })
    this.channels.set(roomId, channel)
    return channel
  }

}
'use strict'

import { logger } from '../../shared/utils'
import MessageType from '../../shared/MessageType'
import WebSocketMessage from '../../shared/model/WebSocketMessage'
import User from '../../shared/model/User'
import { connection, IMessage } from 'websocket'
import RoomChannelRegistry from '../room/RoomChannelRegistry'
import { Subscription } from './Subscription'
import { MessagePayload } from '../../shared/Types'
import RoomChannel from '../room/RoomChannel'
import { EventEmitter } from 'events'

const log = logger('MessageTransport')
export const MESSAGE_IDENTIFIER = '__message__'

export default class MessageTransport extends EventEmitter {

  public subscribers = new Map<string, Subscription>()

  constructor(public channels: RoomChannelRegistry) {
    super()
  }

  registerConnection(connection: connection) {
    connection.on('message', (message: IMessage) => {
      if (message.type === 'utf8' && message.utf8Data) {
        const parsed = WebSocketMessage.fromString(message.utf8Data)
        const type = MessageType.forName(parsed.type)
        log.info(`received message ${type.name}`)
        return this.emit(MESSAGE_IDENTIFIER, connection, parsed)
      }
      throw Error('message did not contain utf8 string data')
    })
  }

  sendToAllInRoom(
    roomId: string, messageType: MessageType, payload: MessagePayload
  ) {
    const message = new WebSocketMessage(messageType, payload).forTransport()
    log.info('sending message to all in room', roomId, message)
    this.channelFor(roomId)
      .forEachUser((user: User) => user.connection.sendUTF(message))
  }

  sendToAllSubscribers(messageType: MessageType, payload: MessagePayload) {
    const message = new WebSocketMessage(messageType, payload).forTransport()
    log.info('sending message to all subscribers', message)
    this.subscribers.forEach(subscriber =>
      subscriber.connection.sendUTF(message))
  }

  channelFor(id: string): RoomChannel {
    return this.channels.get(id)
  }

}
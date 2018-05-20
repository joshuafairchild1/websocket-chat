'use strict'

import { logger } from '../shared/utils'
import MessageType from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import User from '../shared/model/User'
import { connection, IMessage } from 'websocket'
import RoomChannelRegistry from './RoomChannelRegistry'
import MessageHandler from './MessageHandler'
import { Subscription } from './Subscription'
import { MessagePayload } from '../shared/Types'

const log = logger('MessageTransport')

export default class MessageTransport {

  private handler = new MessageHandler(this)
  public subscribers = new Map<string, Subscription>()

  constructor(public channels: RoomChannelRegistry) { }

  registerConnection(connection: connection) {
    connection.on('message', (message: IMessage) => {
      if (message.type === 'utf8' && message.utf8Data) {
        const parsed = WebSocketMessage.fromString(message.utf8Data)
        const type = MessageType.forName(parsed.type)
        log(`received message ${type.name()}`)
        log(JSON.stringify(parsed))
        this.handler.handle(connection, parsed)
        return
      }
      throw Error('message did not contain utf8 string data')
    })
  }

  sendToAllInRoom(
    roomId: string, messageType: MessageType, payload: MessagePayload
  ) {
    const message = new WebSocketMessage(messageType, payload).forTransport()
    log('sending message to all in room', roomId, message)
    this.channelFor(roomId)
      .forEachUser((user: User) => user.connection.sendUTF(message))
  }

  sendToAllSubscribers(messageType: MessageType, payload: MessagePayload) {
    const message = new WebSocketMessage(messageType, payload).forTransport()
    log('sending message to all subscribers', message)
    this.subscribers.forEach(subscriber =>
      subscriber.connection.sendUTF(message))
  }

  channelFor(id: string) {
    return this.channels.get(id)
  }

}
'use strict'

import { logger } from '../shared/utils'
import ChatMessage from '../shared/model/ChatMessage'
import ChatRoom from './ChatRoom'
import ConnectPayload from '../shared/model/ConnectPayload'
import MessageType from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import { MessageStrategy, ConnectStrategy, DisconnectStrategy, SendChatStrategy,
  SetUsernameStrategy
} from '../shared/MessageStrategy'
import User from '../shared/model/User'
import { connection, IMessage } from 'websocket'

const log = logger('ChatTransport')

export default class ChatTransport {

  constructor(private readonly room: ChatRoom) {
    new ConnectStrategy(this.handleConnect, this)
    new DisconnectStrategy((_: any, message: WebSocketMessage) =>
      this.handleDisconnect(message.clientId))
    new SendChatStrategy((_: any, message: WebSocketMessage) =>
      this.handleChatMessage(new ChatMessage(message.clientId,
        message.payload.senderName, message.payload.content)))
    new SetUsernameStrategy(this.handleNewUsername, this)
  }

  registerConnection(connection: connection) {
    connection.on('message', (message: IMessage) => {
      if (message.type === 'utf8' && message.utf8Data) {
        const parsed = WebSocketMessage.fromString(message.utf8Data)
        const type = MessageType.forName(parsed.type)
        log(`received message ${type.name()}`)
        MessageStrategy.callFor(type, connection, parsed)
        return
      }
      throw Error('message did not contain utf8 string data')
    })
  }

  private handleConnect(connection: connection) {
    const { clientId } = this.room.newUser(connection)
    log('created new user', clientId)
    const payload = new ConnectPayload(clientId, this.room.getMessages())
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.newConnection, payload).forTransport())
  }

  private handleDisconnect(clientId: string) {
    this.room.userLeft(clientId)
    const message = new ChatMessage(
      clientId, 'System', `User ${clientId} has disconnected`)
    this.handleChatMessage(message)
  }

  private handleChatMessage(message: ChatMessage) {
    this.room.addMessage(message)
    this.sendToAll(new WebSocketMessage(
      MessageType.server.newMessage, message, message.senderId).forTransport())
  }

  private handleNewUsername(connection: connection, message: WebSocketMessage
  ) {
    const { clientId, payload: name } = message
    this.room.newUsername(clientId, name)
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.updateUsername, name).forTransport())
    this.sendToAll(new WebSocketMessage(
      MessageType.server.updateMessages, this.room.getMessages())
        .forTransport())
  }

  private sendToAll(message: string) {
    log('sending message to all', message)
    this.room.forEachUser((user: User) => user.connection.sendUTF(message))
  }

}
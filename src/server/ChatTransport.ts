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
import MessageRegistry from './MessageRegistry'
import { connection, IMessage } from 'websocket'

const log = logger('ChatTransport')

export default class ChatTransport {

  private readonly room: ChatRoom

  constructor() {
    this.room = new ChatRoom(new MessageRegistry())
    new ConnectStrategy(this._handleConnect, this)
    new DisconnectStrategy((_: any, message: WebSocketMessage) => this._handleDisconnect(message.clientId))
    new SendChatStrategy((_: any, message: WebSocketMessage) => this._handleChatMessage(new ChatMessage(
      message.clientId, message.payload.senderName, message.payload.content)))
    new SetUsernameStrategy(this._handleNewUsername, this)
  }

  registerConnection(connection: connection) {
    connection.on('message', (message: IMessage) => {
      log('received message', message)
      if (message.type === 'utf8' && message.utf8Data) {
        const parsed = WebSocketMessage.fromString(message.utf8Data)
        const type = MessageType.forName(parsed.type)
        MessageStrategy.callFor(type, connection, parsed)
        return
      }
      throw Error('message did not contain utf8 string data')
    })
  }

  _handleConnect(connection: connection) {
    const { clientId } = this.room.newUser(connection)
    console.warn('created new user', clientId)
    const payload = new ConnectPayload(clientId, this.room.getMessages())
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.newConnection, payload).forTransport())
  }

  _handleDisconnect(clientId: string) {
    this.room.userLeft(clientId)
    const message = new ChatMessage(
      clientId, 'System', `User ${clientId} has disconnected`)
    this._handleChatMessage(message)
  }

  _handleChatMessage(message: ChatMessage) {
    this.room.addMessage(message)
    this._sendToAll(new WebSocketMessage(
      MessageType.server.newMessage, message, message.senderId).forTransport())
  }

  _handleNewUsername(connection: connection, message: WebSocketMessage
  ) {
    console.warn('message', message)
    const { clientId, payload: name } = message
    this.room.newUsername(clientId, name)
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.updateUsername, name).forTransport())
    this._sendToAll(new WebSocketMessage(
      MessageType.server.updateMessages, this.room.getMessages())
        .forTransport())
  }

  /**
   * @param message {string} stringified {WebSocketMessage}
   * @private
   */
  _sendToAll(message: string) {
    log('sending message to all', message)
    this.room.forEachUser((user: User) => user.connection.sendUTF(message))
  }

}
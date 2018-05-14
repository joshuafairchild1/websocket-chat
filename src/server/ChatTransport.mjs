'use strict'

import { ensure, logger } from '../shared/utils'
import ChatMessage from '../shared/model/ChatMessage'
import ChatRoom from './ChatRoom'
import ConnectPayload from '../shared/model/ConnectPayload'
import MessageRegistry from './MessageRegistry'
import MessageType from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import MessageStrategy from './MessageStrategy'

const log = logger('ChatTransport')

export default class ChatTransport {

  constructor() {
    const { connect, disconnect, sendChat, setUsername } = MessageType.client
    this._room = new ChatRoom(new MessageRegistry())
    new MessageStrategy(connect, this._handleConnect)
    new MessageStrategy(disconnect, (_, message) => this._handleDisconnect(message))
    new MessageStrategy(sendChat, (_, message) => this._handleChatMessage(new ChatMessage(
      message.clientId, message.payload.senderName, message.payload.content)))
    new MessageStrategy(setUsername, this._handleNewUsername.bind(this))
  }

  /**
   * @param connection {WebSocketConnection}
   */
  registerConnection(connection) {
    connection.on('message', message => this._onMessage(connection, message))
  }

  /**
   * @param connection {WebSocketConnection}
   * @param message {*}
   * @private
   */
  _onMessage(connection, message) {
    log('received message', message)
    if (message.type === 'utf8' && message.utf8Data) {
      message = WebSocketMessage.fromString(message.utf8Data, 'client')
      const type = MessageType.forName(message.type)
      MessageStrategy.callFor(type, this, connection, message)
      return
    }
    throw Error('message did not contain utf8 string data')
  }

  /**
   * @param connection {WebSocketConnection}
   * @private
   */
  _handleConnect(connection) {
    const { clientId } = this._room.newUser(connection)
    const payload = new ConnectPayload(clientId, this._room.getMessages())
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.newConnection, payload).forTransport())
  }

  /**
   * @param clientId {string}
   * @private
   */
  _handleDisconnect(clientId) {
    ensure(clientId, String, 'client ID')
    this._room.userLeft(clientId)
    const message = new ChatMessage(
      clientId, 'System', `User ${clientId} has disconnected`)
    this._handleChatMessage(message)
  }

  /**
   * @param message {ChatMessage}
   * @private
   */
  _handleChatMessage(message) {
    this._room.addMessage(message)
    this._sendToAll(new WebSocketMessage(
      MessageType.server.newMessage, message, message.senderId).forTransport())
  }

  /**
   * @param connection {WebSocketConnection}
   * @param message {WebSocketMessage}
   * @private
   */
  _handleNewUsername(connection, message) {
    const { clientId, payload: name } = message
    this._room.newUsername(clientId, name)
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.updateUsername, name).forTransport())
    this._sendToAll(new WebSocketMessage(
      MessageType.server.updateMessages, this._room.getMessages())
        .forTransport())
  }

  /**
   * @param message {string} stringified {WebSocketMessage}
   * @private
   */
  _sendToAll(message) {
    ensure(message, String, 'stringified WebSocketMessage')
    log('sending message to all', message)
    this._room.forEachUser(user => user.connection.sendUTF(message))
  }

}
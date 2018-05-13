'use strict'

import MESSAGE_TYPE from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import { randomId } from '../shared/utils'
import ChatMessage from '../shared/model/ChatMessage'
import ChatRegistry from './ChatRegistry'

const log = (...statements) => console.log('[ChatTransport]', ...statements)

class User {
  constructor(connection, name = null) {
    this.clientId = randomId()
    this.name = name || 'Anonymous'
    this.connection = connection
  }
}

export default class ChatTransport {

  constructor() {
    /** @type {Map.<string, User>} */
    this._clients = new Map()
    this._chatMessages = new ChatRegistry()
  }

  /**
   * @param connection {WebSocketConnection}
   */
  registerConnection(connection) {
    connection.on('message', message => this._onMessage(message, connection))
  }

  /**
   * @param message {*}
   * @param connection {WebSocketConnection}
   * @private
   */
  _onMessage(message, connection) {
    if (message.type === 'utf8') {
      const { connect, disconnect, sendChat, setUsername } = MESSAGE_TYPE.client
      message = WebSocketMessage.fromString(message.utf8Data)
      log('received message', message)
      switch (message.type) {
        case connect: return this._handleConnect(connection)
        case disconnect: return this._handleDisconnect(message.clientId)
        case sendChat: return this._handleChatMessage(new ChatMessage(
          message.clientId, message.payload.senderName, message.payload.content))
        case setUsername: return this._handleNewUsername(message, connection)
      }
    }
  }

  /**
   * @param connection {WebSocketConnection}
   * @private
   */
  _handleConnect(connection) {
    const user = new User(connection)
    const { clientId } = user
    this._clients.set(clientId, user)
    connection.sendUTF(new WebSocketMessage(MESSAGE_TYPE.server.newConnection,
      { clientId, messages: this._chatMessages.getAll() }).forTransport())
  }

  /**
   * @param clientId {string}
   * @private
   */
  _handleDisconnect(clientId) {
    const client = this._clients.get(clientId)
    this._clients.delete(clientId)
    log('client', clientId, 'disconnected',
      this._clients.size, 'connections remaining')
    const message = new ChatMessage(
      clientId, client.name || clientId, `User ${clientId} has disconnected`)
    this._handleChatMessage(message)
  }

  /**
   * @param message {ChatMessage}
   * @private
   */
  _handleChatMessage(message) {
    this._chatMessages.add(message)
    this._sendToAll(new WebSocketMessage(
      MESSAGE_TYPE.server.newMessage, message, message.senderId).forTransport())
  }

  /**
   * @param message {WebSocketMessage}
   * @param connection {WebSocketConnection}
   * @private
   */
  _handleNewUsername(message, connection) {
    const { clientId, payload } = message
    const user = this._clients.get(clientId)
    if (!user) {
      throw Error('could not locate user ' + clientId)
    }
    user.name = payload
    this._chatMessages.updateNameFor(clientId, payload)
    connection.sendUTF(new WebSocketMessage(
      MESSAGE_TYPE.server.updateUsername, payload).forTransport())
    this._sendToAll(new WebSocketMessage(
      MESSAGE_TYPE.server.updateMessages, this._chatMessages.getAll())
        .forTransport())
  }

  /**
   * @param message {string} stringified {WebSocketMessage}
   * @private
   */
  _sendToAll(message) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message)
    }
    log('sending message to all', message)
    this._clients.forEach(user => user.connection.sendUTF(message))
  }

}
'use strict'

import { ensure, logger } from '../shared/utils'
import ChatMessage from '../shared/model/ChatMessage'
import MessageRegistry from './MessageRegistry'
import User from '../shared/model/User'

const log = logger('ChatRoom')

export default class ChatRoom {

  /**
   * @param messages {MessageRegistry}
   */
  constructor(messages) {
    ensure(messages, MessageRegistry, 'message registry')
    /** @type {Map<string, User>} */
    this._clients = new Map()
    this._messages = messages
  }

  /**
   * @param message {ChatMessage}
   */
  addMessage(message) {
    ensure(message, ChatMessage, 'chat message')
    this._messages.add(message)
  }

  /**
   * @param connection {WebSocketConnection}
   * @return {User}
   */
  newUser(connection) {
    const user = new User(connection)
    const { clientId } = user
    this._clients.set(clientId, user)
    return user
  }

  /**
   * @param clientId
   * @return {User}
   */
  userLeft(clientId) {
    const user = this._clients.get(clientId)
    if (!user) {
      log('could not locate user who disconnected', clientId)
      return
    }
    this._clients.delete(clientId)
    log('client', clientId, 'disconnected',
      this._clients.size, 'connections remaining')
    return user
  }

  /**
   * @param fn {Function}
   */
  forEachUser(fn) {
    this._clients.forEach(fn)
  }

  /**
   * @return {ChatMessage[]}
   */
  getMessages() {
    return this._messages.getAll()
  }

  newUsername(clientId, name) {
    const user = this._clients.get(clientId)
    if (!user) {
      throw Error('could not locate user ' + clientId)
    }
    user.name = name
    this._updateMessages(clientId, name)
  }

  /**
   * @param clientId {string}
   * @param name {string}
   */
  _updateMessages(clientId, name) {
    ensure(clientId, String, 'client ID')
    ensure(name, String, 'username')
    this._messages.updateNameFor(clientId, name)
  }
}
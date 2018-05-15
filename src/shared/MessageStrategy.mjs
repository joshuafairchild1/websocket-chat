'use strict'

import { ensure, logger } from './utils'
import MessageType from './MessageType'

const log = logger('MessageStrategy')
const { server, client } = MessageType

const STRATEGIES = Symbol('message-strategies')

export class MessageStrategy {

  /**
   * @param messageType {MessageType}
   * @param handler {Function}
   */
  constructor(messageType, handler) {
    ensure(messageType, MessageType, 'message type')
    ensure(handler, Function, 'handler function')
    MessageStrategy[STRATEGIES].set(messageType, handler)
  }

  /**
   * @param messageType {MessageType}
   * @param args
   * @return {Function}
   */
  static callFor(messageType, ...args) {
    ensure(messageType, MessageType, 'message type')
    const strategy = MessageStrategy[STRATEGIES].get(messageType)
    if (!strategy || !(strategy instanceof Function)) {
      throw Error(`could not find strategy for message "${messageType.name}"`)
    }
    try {
      strategy(...args)
    } catch (ex) {
      log('exception while invoking strategy for message', messageType, ex)
    }
  }
}

MessageStrategy[STRATEGIES] = new Map()

export class NewConnectionStrategy extends MessageStrategy {
  constructor(handler, receiver = null) {
    super(server.newConnection, handler.bind(receiver))
  }
}

export class NewMessageStrategy extends MessageStrategy {
  constructor(handler, receiver = null) {
    super(server.newMessage, handler.bind(receiver))
  }
}

export class UpdateUsernameStrategy extends MessageStrategy {
  constructor(handler, receiver = null) {
    super(server.updateUsername, handler.bind(receiver))
  }
}

export class UpdateMessagesStrategy extends MessageStrategy {
  constructor(handler, receiver = null) {
    super(server.updateMessages, handler.bind(receiver))
  }
}

export class ConnectStrategy extends MessageStrategy {
  constructor(handler, receiver = null) {
    super(client.connect, handler.bind(receiver))
  }
}

export class DisconnectStrategy extends MessageStrategy {
  constructor(handler, receiver = null) {
    super(client.disconnect, handler.bind(receiver))
  }
}

export class SendChatStrategy extends MessageStrategy {
  constructor(handler, receiver = null) {
    super(client.sendChat, handler.bind(receiver))
  }
}

export class SetUsernameStrategy extends MessageStrategy {
  constructor(handler, receiver = null) {
    super(client.setUsername, handler.bind(receiver))
  }
}
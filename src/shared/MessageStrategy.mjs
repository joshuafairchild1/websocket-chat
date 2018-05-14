'use strict'

import { ensure, logger } from './utils'
import MessageType from './MessageType'

const log = logger('MessageStrategy')

const STRATEGIES = Symbol('message-strategies')

export default class MessageStrategy {

  /**
   * @param messageType {MessageType}
   * @param handler {Function}
   * @param receiver {*}
   */
  constructor(messageType, handler, receiver = this) {
    ensure(messageType, MessageType, 'message type')
    ensure(handler, Function, 'handler function')
    MessageStrategy[STRATEGIES].set(messageType, handler.bind(receiver))
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
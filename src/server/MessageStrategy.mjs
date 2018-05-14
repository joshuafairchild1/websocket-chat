'use strict'

import { ensure, logger } from '../shared/utils'
import MessageType from '../shared/MessageType'

const log = logger('MessageStrategy')

const STRATEGIES = Symbol('message-strategies')

export default class MessageStrategy {

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
   * @param receiver {*}
   * @param args
   * @return {Function}
   */
  static callFor(messageType, receiver, ...args) {
    ensure(messageType, MessageType, 'message type')
    const strategy = MessageStrategy[STRATEGIES].get(messageType)
    if (!strategy || !(strategy instanceof Function)) {
      throw Error(`could not find strategy for message "${messageType.name}"`)
    }
    try {
      MessageStrategy[STRATEGIES].get(messageType).call(receiver, ...args)
    } catch (ex) {
      log('exception while invoking strategy for message', messageType, ex)
    }
  }
}

MessageStrategy[STRATEGIES] = new Map()
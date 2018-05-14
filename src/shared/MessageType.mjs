'use strict'

import { ensure } from './utils.mjs'

const NAME = Symbol('name')

/** @type {Map.<string, MessageType>} */
const KNOWN_MESSAGE_TYPES = new Map()

export default class MessageType {

  /**
   * @param type {string}
   */
  constructor(type) {
    ensure(type, String, 'message type')
    this[NAME] = type
    KNOWN_MESSAGE_TYPES.set(type, this)
  }

  get name() {
    return this[NAME]
  }

  hasNoType() {
    return this === MessageType.client.connect
      || this === MessageType.client.disconnect
  }

  /**
   * @param name
   * @return {MessageType}
   */
  static forName(name) {
    const type = KNOWN_MESSAGE_TYPES.get(name)
    if (!type) {
      throw Error('no message type with name: ' + name)
    }
    return type
  }

  /**
   * @param type {MessageType|string}
   */
  static validate(type) {
    const name = type && type.name || type
    ensure(name, String, 'message type')
    if (MessageType.forName(name)) {
      return
    }
    throw Error('invalid message type: ' + name)
  }

}

MessageType.server = {
  newConnection: new MessageType('newConnection'),
  newMessage: new MessageType('newMessage'),
  updateUsername: new MessageType('updateUsername'),
  updateMessages: new MessageType('updateMessages')
}

MessageType.client = {
  connect: new MessageType('connect'),
  disconnect: new MessageType('disconnect'),
  sendChat: new MessageType('sendChat'),
  setUsername: new MessageType('setUsername')
}

Object.freeze(MessageType)
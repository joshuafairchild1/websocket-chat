'use strict'

import { logger} from '../shared/utils.mjs'

const log = logger('MessageRegistry')

export default class MessageRegistry {

  constructor() {
    /** @type {ChatMessage[]} */
    this._messages = []
  }

  /**
   * @param message {ChatMessage}
   */
  add(message) {
    log('saving message', message)
    this._messages.push(message)
  }

  /**
   * @return {ChatMessage[]}
   */
  getAll() {
    return this._messages
  }

  /**
   * @param clientId {string}
   * @param name {string}
   */
  updateNameFor(clientId, name) {
    this._messages.forEach(message => {
      if (message.senderId === clientId) {
        message.senderName = name
      }
    })
  }
}
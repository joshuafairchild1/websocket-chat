'use strict'

export default class ChatRegistry {

  constructor() {
    this._messages = []
  }

  /**
   * @param message {ChatMessage}
   */
  add(message) {
    console.warn('saving message', message)
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
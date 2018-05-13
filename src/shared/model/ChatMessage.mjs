'use strict'

export default class ChatMessage {

  /**
   * @param senderId {string}
   * @param senderName {string}
   * @param content {string}
   */
  constructor(senderId, senderName, content) {
    if (!senderId) {
      throw Error('missing sender ID')
    }
    this.senderId = senderId
    this.senderName = senderName
    this.content = content
    this.timestamp = new Date()
  }

}
'use strict'

import TimeSource from '../TimeSource.mjs'
import { ensure } from '../utils.mjs'

export default class ChatMessage {

  /**
   * @param senderId {string}
   * @param senderName {string}
   * @param content {string}
   */
  constructor(senderId, senderName, content) {
    ensure(senderId, String, 'sender ID')
    ensure(senderName, String, 'sender name')
    ensure(content, String, 'message content')
    if (!senderId) {
      throw Error('missing sender ID')
    }
    this.senderId = senderId
    this.senderName = senderName
    this.content = content
    this.timestamp = TimeSource.date()
  }

}
'use strict'

import TimeSource from '../TimeSource'

export default class ChatMessage {

  public timestamp: number = TimeSource.now()

  constructor(
    public senderId: string, public senderName: string, public content: string
  ) {
    if (!senderId) {
      throw Error('missing sender ID')
    }
  }

}
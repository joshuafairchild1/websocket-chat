'use strict'

import TimeSource from '../TimeSource'

export default class ChatMessage {

  public timestamp: number = TimeSource.now()
  public roomId: string | null = null
  constructor(
    public senderId: string, public senderName: string, public content: string
  ) {
    if (!senderId) {
      throw Error('missing sender ID')
    }
  }

}
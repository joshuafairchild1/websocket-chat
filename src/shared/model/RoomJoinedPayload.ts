'use strict'

import ChatMessage from './ChatMessage'

export default class RoomJoinedPayload {
  constructor(
    public roomId: string,
    public clientId: string,
    public messages: ChatMessage[]
  ) {}
}
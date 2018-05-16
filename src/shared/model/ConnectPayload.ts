'use strict'

import ChatMessage from './ChatMessage'

export default class ConnectPayload {
  constructor(public clientId: string, public messages: ChatMessage[]) {}
}
'use strict'

import { ensure } from '../utils.mjs'

export default class ConnectPayload {
  constructor(clientId, messages) {
    ensure(clientId, String, 'client ID')
    ensure(messages, Array, 'chat messages')
    this.clientId = clientId
    this.messages = messages
  }
}
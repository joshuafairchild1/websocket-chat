'use strict'

import MESSAGE_TYPE from '../MessageType'
import { toJson } from '../utils'

export default class WebSocketMessage {

  /**
   * @param type {string|MESSAGE_TYPE}
   * @param payload {*|null}
   * @param clientId {string|null} present if the message is sent from the client
   */
	constructor(type, payload = null, clientId = null) {
		if (!(MESSAGE_TYPE.client[type] || MESSAGE_TYPE.server[type])) {
			throw Error('invalid message type: ' + type)
		}
		this.type = type
		this.payload = payload
    this.clientId = clientId
    Object.freeze(this)
	}

	forTransport() {
		return JSON.stringify(this)
	}

  /**
   * @param utf8String {string}
   * @return {WebSocketMessage}
   */
	static fromString(utf8String) {
    const { type, payload = null, clientId = null } = toJson(utf8String)
    return new WebSocketMessage(type, payload, clientId)
  }

}
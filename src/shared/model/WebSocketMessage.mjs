'use strict'

import {ensure, toJson} from '../utils.mjs'
import ChatMessage from './ChatMessage.mjs'
import ConnectPayload from './ConnectPayload.mjs'
import MessageType from '../MessageType.mjs'

const { server, client } = MessageType

const PAYLOAD_TYPES = {
  [server.newConnection.name]: ConnectPayload,
  [server.newMessage.name]: ChatMessage,
  [server.updateUsername.name]: String,
  [server.updateMessages.name]: Array,
  [client.sendChat.name]: ChatMessage,
  [client.setUsername.name]: String
}

/**
 * Return the payload type associated with a given message type, or null
 * if that message does not send a payload
 * @param messageType {string}
 * @return {ConnectPayload|ChatMessage|String|ChatMessage[]|null}
 */
function payloadTypeFor(messageType) {
  if (MessageType.forName(messageType).hasNoType()) {
    return
  }
  const type = PAYLOAD_TYPES[messageType]
  if (!type) {
    throw Error('no payload type mapped to message type: ' + messageType)
  }
  return type
}

export default class WebSocketMessage {

  /**
   * @param type {MessageType}
   * @param payload {*|null}
   * @param clientId {string|null} present if the message is sent from the client
   */
	constructor(type, payload = null, clientId = null) {
    MessageType.validate(type)
    const { name } = type
    if (payload) {
      WebSocketMessage.validatePayload(name, payload)
    }
		if (clientId) {
		  ensure(clientId, String, 'client ID')
    }
		this.type = name
		this.payload = payload
    this.clientId = clientId
    Object.freeze(this)
	}

	forTransport() {
		return JSON.stringify(this)
	}

  /**
   * @param utf8String {string}
   * @param sender {string}
   * @return {WebSocketMessage}
   */
	static fromString(utf8String, sender) {
	  ensure(utf8String, String, 'uf8 string')
    ensure(sender, String, 'server or client')
    const {
      /** @type {ConnectPayload|ChatMessage|String|ChatMessage[]|null} */
	    payload = null,
      type, clientId = null } = toJson(utf8String)
    const payloadType = payloadTypeFor(type)
    let typedPayload
    if (payloadType === null) {
	    typedPayload = null
    } else {
      switch (payloadType) {
        case ConnectPayload:
          typedPayload = new ConnectPayload(payload.clientId, payload.messages)
          break
        case ChatMessage:
          typedPayload = new ChatMessage(
            payload.senderId, payload.senderName, payload.content)
          break
        default: typedPayload = payload
      }
    }
    return new WebSocketMessage(MessageType.forName(type), typedPayload, clientId)
  }

  /**
   * @param typeName {string}
   * @param payload {*}
   */
  static validatePayload(typeName, payload) {
    ensure(typeName, String, 'message type name')
    ensure(payload, payloadTypeFor(typeName), `payload for ${typeName}`)
  }

}
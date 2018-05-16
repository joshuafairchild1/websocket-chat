'use strict'

import { ensure, toJson } from '../utils'
import ChatMessage from './ChatMessage'
import ConnectPayload from './ConnectPayload'
import MessageType from '../MessageType'
import { MessagePayload } from '../Types'

const { server, client } = MessageType

const PAYLOAD_TYPES = {
  [server.newConnection.name()]: ConnectPayload,
  [server.newMessage.name()]: ChatMessage,
  [server.updateUsername.name()]: String,
  [server.updateMessages.name()]: Array,
  [client.sendChat.name()]: ChatMessage,
  [client.setUsername.name()]: String
}

/**
 * Return the payload type associated with a given message type, or null
 * if that message does not send a payload
 */
function payloadTypeFor(messageType: string): Function  {
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

  public type: string

  /**
   * @param type {MessageType}
   * @param payload {*|null}
   * @param clientId {string|null} present if the message is sent from the client
   */
	constructor(
	  type: MessageType,
    public payload: any = null,
    public clientId: string = null
  ) {
    MessageType.validate(type)
    const name = type.name()
    if (payload) {
      WebSocketMessage.validatePayload(name, payload)
    }
		this.type = name
    Object.freeze(this)
	}

	forTransport(): string {
		return JSON.stringify(this)
	}

	static fromString(utf8String: string): WebSocketMessage {
    const { type, payload = null, clientId = null } = toJson(utf8String)
    const payloadType: Function = payloadTypeFor(type)
    let typedPayload: MessagePayload
    switch (payloadType) {
      case ConnectPayload:
        typedPayload = new ConnectPayload(payload.clientId, payload.messages)
        break
      case ChatMessage:
        typedPayload = new ChatMessage(
          payload.senderId, payload.senderName, payload.content)
        break
      case String:
      case Array:
      case null:
        typedPayload = payload
        break
  }
    return new WebSocketMessage(MessageType.forName(type), typedPayload, clientId)
  }

  static validatePayload(typeName: string, payload: MessagePayload) {
    ensure(payload, payloadTypeFor(typeName), `payload for ${typeName}`)
  }

}
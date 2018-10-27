'use strict'

import { safeDeserialize } from '../utils'
import ChatMessage from './ChatMessage'
import ConnectPayload from './ConnectPayload'
import MessageType from '../MessageType'
import Room from './Room'
import RoomJoinedPayload from './RoomJoinedPayload'
import { MessagePayload } from '../Types'

const { server, client } = MessageType
const NO_PAYLOAD = Symbol('no-payload')
const PAYLOAD_TYPES = {
  [server.newConnection.name]: ConnectPayload,
  [server.newRoom.name]: Room,
  [server.newMessage.name]: ChatMessage,
  // payload: new username
  [server.updateUsername.name]: String,
  // payload: ChatMessage[]
  [server.updateMessages.name]: Array,
  [server.roomJoined.name]: RoomJoinedPayload,
  [client.createRoom.name]: Room,
  // payload: subscriptionId
  [client.disconnect.name]: String,
  [client.sendChat.name]: ChatMessage,
  // payload: username to set
  [client.setUsername.name]: String
}

export default class WebSocketMessage {

  public type: string

	constructor(
	  messageType: MessageType,
    public payload: any = null,
    public clientId: string = null,
    public roomId: string = null
  ) {
    MessageType.validate(messageType)
    const name = messageType.name
    if (payload) {
      WebSocketMessage.validatePayload(name, payload)
    } else if (messageType.requiresPayload()) {
      throw Error(`payload is required for message type ${messageType.name}`)
    }
		this.type = name
    Object.freeze(this)
	}

	forTransport(): string {
		return JSON.stringify(this)
	}

	static fromString(utf8String: string): WebSocketMessage {
    const {
      type, payload = null, clientId = null, roomId = null
    } = safeDeserialize<WebSocketMessage>(utf8String)
    const payloadType = WebSocketMessage.payloadTypeFor(type)
    const typedPayload = toTypedPayload(payloadType, payload)
    return new WebSocketMessage(
      MessageType.forName(type), typedPayload, clientId, roomId)
  }

  private static payloadTypeFor(messageType: string): Function | Symbol  {
    if (!MessageType.forName(messageType).requiresPayload()) {
      return NO_PAYLOAD
    }
    const type = PAYLOAD_TYPES[messageType]
    if (!type) {
      throw Error('no payload type mapped to message type: ' + messageType)
    }
    return type
  }

  private static validatePayload(typeName: string, payload: MessagePayload) {
    const payloadType = WebSocketMessage.payloadTypeFor(typeName)
	  if (payloadType !== NO_PAYLOAD && payload.constructor !== payloadType) {
	    throw Error(`payload not of type ${typeName}: ${JSON.stringify(payload)}`)
    }
  }

}

function toTypedPayload(
  constructorType: Function | Symbol, payload: any
): MessagePayload {
  let typedPayload: MessagePayload
  switch (constructorType) {
    case ConnectPayload:
      return new ConnectPayload(payload.rooms, payload.subscriptionId)
    case ChatMessage:
      return typedPayload = new ChatMessage(
        payload.senderId, payload.senderName, payload.content)
    case Room:
      return new Room(
        payload.name, payload.messages).withId(payload._id)
    case RoomJoinedPayload:
      return new RoomJoinedPayload(
        payload.roomId, payload.clientId, payload.messages)
    case Array:
      return payload.map((message: ChatMessage) =>
        new ChatMessage(message.senderId, message.senderName, message.content))
    case String:
    case NO_PAYLOAD:
      return payload
  }
}
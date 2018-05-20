'use strict'

import { toJson } from '../utils'
import ChatMessage from './ChatMessage'
import ConnectPayload from './ConnectPayload'
import MessageType from '../MessageType'
import { MessagePayload } from '../Types'
import Room from './Room'
import RoomJoinedPayload from './RoomJoinedPayload'

const { server, client } = MessageType

const PAYLOAD_TYPES = {
  [server.newConnection.name()]: ConnectPayload,
  [server.newRoom.name()]: Room,
  [server.newMessage.name()]: ChatMessage,
  // payload: new username
  [server.updateUsername.name()]: String,
  // payload: ChatMessage[]
  [server.updateMessages.name()]: Array,
  [server.roomJoined.name()]: RoomJoinedPayload,
  [client.createRoom.name()]: Room,
  // payload: roomId
  [client.joinRoom.name()]: String,
  // payload: subscriptionId
  [client.disconnect.name()]: String,
  [client.sendChat.name()]: ChatMessage,
  // payload: username to set
  [client.setUsername.name()]: String
}

/**
 * Return the payload type associated with a given message type, or null
 * if that message does not send a payload
 */
function payloadTypeFor(messageType: string): Function | null  {
  if (MessageType.forName(messageType).hasNoPayload()) {
    return null
  }
  const type = PAYLOAD_TYPES[messageType]
  if (!type) {
    throw Error('no payload type mapped to message type: ' + messageType)
  }
  return type
}

export default class WebSocketMessage {

  public type: string

	constructor(
	  type: MessageType,
    public payload: any = null,
    public clientId: string = null,
    public roomId: string = null
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
    const {
      type, payload = null, clientId = null, roomId = null
    } = toJson(utf8String)
    const payloadType: Function = payloadTypeFor(type)
    let typedPayload: MessagePayload
    switch (payloadType) {
      case ConnectPayload:
        typedPayload = new ConnectPayload(payload.rooms, payload.subscriptionId)
        break
      case ChatMessage:
        typedPayload = new ChatMessage(
          payload.senderId, payload.senderName, payload.content)
        break
      case Room:
        typedPayload = new Room(
          payload.name, payload.messages).withId(payload.id)
        break
      case RoomJoinedPayload:
        typedPayload = new RoomJoinedPayload(
          payload.roomId, payload.clientId, payload.messages)
        break
      case String:
      case Array:
      case null:
        typedPayload = payload
        break
  }
    return new WebSocketMessage(
      MessageType.forName(type), typedPayload, clientId, roomId)
  }

  static validatePayload(typeName: string, payload: MessagePayload) {
	  if (payload.constructor !== payloadTypeFor(typeName)) {
	    throw Error(`payload not of type ${typeName} ${JSON.stringify(payload)}`)
    }
  }

}
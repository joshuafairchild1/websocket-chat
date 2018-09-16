'use strict'

import Room from '../shared/model/Room'
import WebSocketClient from './WebSocketClient'
import MessageType from '../shared/MessageType'
import ChatMessage from '../shared/model/ChatMessage'
import { ClientMessagePayload } from '../shared/Types'

const { client } = MessageType

export default class ClientMessenger {

  constructor(private webSocketClient: WebSocketClient) {}

  sendCreateRoom = (room: Room) =>
    this.send(client.createRoom, room)

  changeUsername = (name: string, clientId: string, roomId: string) =>
    this.send(client.setUsername, name, clientId, roomId)

  sendChatMessage = (
    text: string, userName: string, clientId: string, roomId: string
  ) => {
    const message = new ChatMessage(clientId, userName, text)
    this.send(client.sendChat, message, clientId, roomId)
  }

  joinRoom = (roomId: string) => this.send(client.joinRoom, null, null, roomId)

  leaveRoom = (clientId: string, roomId: string) =>
    this.send(client.leaveRoom, null, clientId, roomId)

  disconnect = (
    subscriptionId: string,
    clientId: string | null = null,
    roomId: string | null = null
  ) => {
    if (clientId && roomId) {
      this.leaveRoom(clientId, roomId)
    }
    this.send(client.disconnect, subscriptionId)
    this.webSocketClient.close()
  }

  private send(
    type: MessageType, payload: ClientMessagePayload = null,
    clientId: string | null = null, roomId: string | null = null
  ): void {
    this.webSocketClient.sendMessage(type, payload, clientId, roomId)
  }
}
'use strict'

import Room from '../shared/model/Room'
import WebSocketClient from './WebSocketClient'
import MessageType from '../shared/MessageType'
import ChatMessage from '../shared/model/ChatMessage'

const { client } = MessageType

export default class ClientMessenger {

  constructor(private webSocketClient: WebSocketClient) {}

  sendCreateRoom = (room: Room) =>
    this.webSocketClient.sendMessage(client.createRoom, room)

  changeUsername = (name: string, clientId: string, roomId: string) =>
    this.webSocketClient.sendMessage(client.setUsername, name, clientId, roomId)

  sendMessage = (
    text: string, userName: string, clientId: string, roomId: string
  ) => {
    const { webSocketClient } = this
    const message = new ChatMessage(clientId, userName, text)
    webSocketClient.sendMessage(client.sendChat, message, clientId, roomId)
  }

  joinRoom = (roomId: string) =>
    this.webSocketClient.sendMessage(client.joinRoom, null, null, roomId)

  leaveRoom = (clientId: string, roomId: string) =>
    this.webSocketClient.sendMessage(client.leaveRoom, null, clientId, roomId)

  disconnect = (
    subscriptionId: string, clientId: string | null = null, roomId: string | null = null
  ) => {
    const { webSocketClient } = this
    if (roomId) {
      this.leaveRoom(clientId, roomId)
    }
    webSocketClient.sendMessage(client.disconnect, subscriptionId)
    webSocketClient.close()
  }

}
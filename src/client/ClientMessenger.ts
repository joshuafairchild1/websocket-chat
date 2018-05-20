'use strict'

import Room from '../shared/model/Room'
import WebSocketClient from './WebSocketClient'
import MessageType from '../shared/MessageType'
import ChatMessage from '../shared/model/ChatMessage'

const { client } = MessageType

export default class ClientMessenger {

  constructor(private webSocketClient: WebSocketClient) {
    this.sendCreateRoom = this.sendCreateRoom.bind(this)
    this.changeUsername = this.changeUsername.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.joinRoom = this.joinRoom.bind(this)
    this.leaveRoom = this.leaveRoom.bind(this)
    this.disconnect = this.disconnect.bind(this)
  }

  sendCreateRoom(room: Room) {
    this.webSocketClient.sendMessage(client.createRoom, room)
  }

  changeUsername(name: string, roomId: string) {
    this.webSocketClient.sendMessage(client.setUsername, name, roomId)
  }

  sendMessage(text: string, userName: string, roomId: string) {
    const { webSocketClient } = this
    const message = new ChatMessage(webSocketClient.id, userName, text)
    webSocketClient.sendMessage(client.sendChat, message, roomId)
  }

  joinRoom(roomId: string) {
    this.webSocketClient.sendMessage(client.joinRoom, null, roomId)
  }

  leaveRoom(roomId: string) {
    this.webSocketClient.sendMessage(client.leaveRoom, null, roomId)
  }

  disconnect(subscriptionId: string, roomId: string | null = null) {
    const { webSocketClient } = this
    if (roomId) {
      webSocketClient.sendMessage(client.leaveRoom, null, roomId)
    }
    webSocketClient.sendMessage(client.disconnect, subscriptionId)
    webSocketClient.close()
  }

}
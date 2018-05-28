'use strict'

import MessageType from '../../shared/MessageType'
import ConnectPayload from '../../shared/model/ConnectPayload'
import WebSocketMessage from '../../shared/model/WebSocketMessage'
import RoomJoinedPayload from '../../shared/model/RoomJoinedPayload'
import ChatMessage from '../../shared/model/ChatMessage'
import Room from '../../shared/model/Room'
import { logger } from '../../shared/utils'
import { connection } from 'websocket'
import MessageTransport from './MessageTransport'
import { Subscription } from './Subscription'
import RoomStore from '../store/RoomStore'

const log = logger('MessageHandler')

const { client, server } = MessageType

export default class MessageHandler {

  constructor(
    private transport: MessageTransport,
    private roomStore: RoomStore
  ) {
    this.handle = this.handle.bind(this)
  }

  handle(connection: connection, message: WebSocketMessage) {
    switch (MessageType.forName(message.type)) {
      case client.connect:
        return this.handleConnect(connection)
      case client.disconnect:
        return this.handleDisconnect(message.payload)
      case client.sendChat:
        return this.handleChatMessage(message.payload, message.roomId)
      case client.setUsername:
        return this.handleNewUsername(connection, message)
      case client.createRoom:
        return this.handleNewRoom(message.payload)
      case client.joinRoom:
        return this.handleJoinRoom(connection, message.roomId)
      case client.leaveRoom:
        return this.handleLeaveRoom(message.clientId, message.roomId)
    }
  }

  private async handleConnect(connection: connection) {
    const { subscribers } = this.transport
    const sub = new Subscription(connection)
    subscribers.set(sub.id, sub)
    log(`new subscriber ${sub.id},`, subscribers.size, 'total subscriptions')
    const payload = new ConnectPayload([...await this.roomStore.getAll()], sub.id)
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.newConnection, payload).forTransport())
  }

  private handleDisconnect(subscriptionId: string) {
    const { subscribers } = this.transport
    subscribers.delete(subscriptionId)
    log(`subscription cancelled for subscriber ${subscriptionId},`,
      subscribers.size, 'subscriptions remaining')
  }

  private handleChatMessage(message: ChatMessage, roomId: string) {
    const { transport } = this
    transport.channelFor(roomId).addMessage(message)
    transport.sendToAllInRoom(roomId, server.newMessage, message)
  }

  private handleNewUsername(connection: connection, message: WebSocketMessage
  ) {
    const { clientId, payload: name, roomId } = message
    const { transport } = this
    const channel = transport.channelFor(roomId)
    const oldName = channel.getUser(clientId).name
    channel.newUsername(clientId, name)
    connection.sendUTF(
      new WebSocketMessage(server.updateUsername, name).forTransport())
    this.handleChatMessage(new ChatMessage(
      clientId, 'System', `User ${oldName} changed their name to ${name}`), roomId)
    transport.sendToAllInRoom(
      roomId, server.updateMessages, channel.getMessages())
  }

  private async handleNewRoom(room: Room) {
    const { name } = room
    if (await this.roomStore.hasName(name)) {
      throw Error(`duplicate room detected: ${name}`)
    }
    try {
      const created = await this.roomStore.create(room)
      this.transport.sendToAllSubscribers(server.newRoom, created)
    } catch (ex) {
      throw Error('exception creating new room: ' + JSON.stringify(ex))
    }
  }

  private async handleJoinRoom(connection: connection, roomId: string) {
    if (!(await this.roomStore.hasId(roomId))) {
      throw Error('no room found for id ' + roomId)
    }
    const channel = this.transport.channels.ensureChannelFor(roomId)
    const { clientId } = channel.newUser(connection)
    const payload = new RoomJoinedPayload(roomId, clientId, channel.getMessages())
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.roomJoined, payload).forTransport())
  }

  private async handleLeaveRoom(clientId: string, roomId: string) {
    if (!(await this.roomStore.hasId(roomId))) {
      throw Error('no room found for id ' + roomId)
    }
    const channel = this.transport.channelFor(roomId)
    channel.userLeft(clientId)
    if (channel.isActive) {
      this.handleChatMessage(new ChatMessage(
        clientId, 'System', `User ${clientId} has disconnected`), roomId)
    }
  }

}
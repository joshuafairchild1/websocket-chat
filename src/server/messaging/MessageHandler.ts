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
    try {
      const payload = new ConnectPayload([...await this.roomStore.getAll()], sub.id)
      connection.sendUTF(new WebSocketMessage(
        MessageType.server.newConnection, payload).forTransport())
    } catch (ex) {
      log('error sending new connection payload', ex)
    }
  }

  private handleDisconnect(subscriptionId: string) {
    const { subscribers } = this.transport
    subscribers.delete(subscriptionId)
    log(`subscription cancelled for subscriber ${subscriptionId},`,
      subscribers.size, 'subscriptions remaining')
  }

  private async handleChatMessage(message: ChatMessage, roomId: string) {
    const { transport } = this
    try {
      await this.throwIfNoRoom(roomId)
      await this.roomStore.addMessage(roomId, message)
    } catch (ex) {
      throw Error('could not add new chat message: ' + JSON.stringify(ex))
    }
    transport.sendToAllInRoom(roomId, server.newMessage, message)
  }

  private async handleNewUsername(connection: connection, message: WebSocketMessage
  ) {
    const { clientId, payload: name, roomId } = message
    const { transport } = this
    const channel = transport.channelFor(roomId)
    try {
      await this.roomStore.updateMessages(roomId, clientId, name)
      connection.sendUTF(
        new WebSocketMessage(server.updateUsername, name).forTransport())
      const systemMessage = new ChatMessage('System', 'System',
        `User ${channel.getUser(clientId).name} changed their name to ${name}`)
      await this.handleChatMessage(systemMessage, roomId)
      transport.sendToAllInRoom(
        roomId, server.updateMessages, await this.roomStore.getMessages(roomId))
    } catch (ex) {
      log('error sending message', ex)
    }
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
      log('exception creating new room: ', ex)
    }
  }

  private async handleJoinRoom(connection: connection, roomId: string) {
    try {
      await this.throwIfNoRoom(roomId)
      const channel = this.transport.channels.ensureChannelFor(roomId)
      const { clientId } = channel.newUser(connection)
      const payload = new RoomJoinedPayload(
        roomId, clientId, await this.roomStore.getMessages(roomId))
      connection.sendUTF(new WebSocketMessage(
        MessageType.server.roomJoined, payload).forTransport())
    } catch (ex) {
      log('error handling joinRoom message', ex)
    }
  }

  private async handleLeaveRoom(clientId: string, roomId: string) {
    try {
      await this.throwIfNoRoom(roomId)
      const channel = this.transport.channelFor(roomId)
      channel.userLeft(clientId)
      if (channel.isActive) {
        await this.handleChatMessage(new ChatMessage(
          'System', 'System', `User ${clientId} has disconnected`), roomId)
      }
    } catch (ex) {
      log('error handling leaveRoom message', ex)
    }
  }

  private async throwIfNoRoom(roomId: string) {
    if (!(await this.roomStore.hasId(roomId))) {
      throw Error('no room found for id ' + roomId)
    }
  }

}
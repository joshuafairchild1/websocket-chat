'use strict'

import MessageType from '../../shared/MessageType'
import ConnectPayload from '../../shared/model/ConnectPayload'
import WebSocketMessage from '../../shared/model/WebSocketMessage'
import RoomJoinedPayload from '../../shared/model/RoomJoinedPayload'
import ChatMessage from '../../shared/model/ChatMessage'
import Room from '../../shared/model/Room'
import { logger } from '../../shared/utils'
import { connection } from 'websocket'
import MessageTransport, { MESSAGE_IDENTIFIER } from './MessageTransport'
import { Subscription } from './Subscription'
import RoomStore from '../store/RoomStore'
import MessageStore from '../store/MessageStore'

const log = logger('MessageHandler')

const { client, server } = MessageType

export default class MessageHandler {

  constructor(
    private transport: MessageTransport,
    private roomStore: RoomStore,
    private messageStore: MessageStore
  ) {
    transport.on(MESSAGE_IDENTIFIER, this.handle)
  }

  handle = async (connection: connection, message: WebSocketMessage) => {
    try {
      switch (MessageType.forName(message.type)) {
        case client.connect:
          return await this.handleConnect(connection)
        case client.disconnect:
          return await this.handleDisconnect(message.payload)
        case client.sendChat:
          return await this.handleChatMessage(message.payload, message.roomId)
        case client.setUsername:
          return await this.handleNewUsername(connection, message)
        case client.createRoom:
          return await this.handleNewRoom(message.payload)
        case client.joinRoom:
          return await this.handleJoinRoom(connection, message.roomId)
        case client.leaveRoom:
          return await this.handleLeaveRoom(message.clientId, message.roomId)
      }
    } catch (ex) {
      log.error('error handling message:', ex)
    }
  }

  private async handleConnect(connection: connection) {
    const { subscribers } = this.transport
    const sub = new Subscription(connection)
    subscribers.set(sub.id, sub)
    log.info(`new subscriber ${sub.id},`, subscribers.size, 'total subscriptions')
    const payload = new ConnectPayload([...await this.roomStore.getAll()], sub.id)
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.newConnection, payload).forTransport())
  }

  private handleDisconnect(subscriptionId: string) {
    const { subscribers } = this.transport
    subscribers.delete(subscriptionId)
    log.info(`subscription cancelled for subscriber ${subscriptionId},`,
      subscribers.size, 'subscriptions remaining')
  }

  private async handleChatMessage(message: ChatMessage, roomId: string) {
    const { transport } = this
    await this.throwIfNoRoom(roomId)
    await this.messageStore.addMessage(roomId, message)
    transport.sendToAllInRoom(roomId, server.newMessage, message)
  }

  private async handleNewUsername(
    connection: connection, message: WebSocketMessage
  ) {
    const { clientId, payload: name, roomId } = message
    const { transport } = this
    const channel = transport.channelFor(roomId)
    await this.messageStore.updateMessages(roomId, name)
    const previousName = channel.getUser(clientId).name
    channel.newUsername(clientId, name)
    connection.sendUTF(
      new WebSocketMessage(server.updateUsername, name).forTransport())
    const systemMessage = new ChatMessage('System', 'System',
      `${previousName} changed their name to "${name}"`)
    await this.handleChatMessage(systemMessage, roomId)
    transport.sendToAllInRoom(
      roomId, server.updateMessages, await this.messageStore.getMessages(roomId))
  }

  private async handleNewRoom(room: Room) {
    const { name } = room
    if (await this.roomStore.hasName(name)) {
      throw Error(`duplicate room detected: ${name}`)
    }
    const created = await this.roomStore.create(room)
    this.transport.sendToAllSubscribers(server.newRoom, created)
  }

  private async handleJoinRoom(connection: connection, roomId: string) {
    await this.throwIfNoRoom(roomId)
    const channel = this.transport.channels.ensureChannelFor(roomId)
    const { clientId } = channel.newUser(connection)
    const payload = new RoomJoinedPayload(
      roomId, clientId, await this.messageStore.getMessages(roomId))
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.roomJoined, payload).forTransport())
  }

  private async handleLeaveRoom(clientId: string, roomId: string) {
    await this.throwIfNoRoom(roomId)
    const channel = this.transport.channelFor(roomId)
    const { name } = channel.userLeft(clientId)
    if (channel.isActive) {
      await this.handleChatMessage(new ChatMessage(
        'System', 'System', `User ${name || clientId} has left the room`), roomId)
    } else {
      log.error('leave room message received on closed channel',
        roomId, 'for user', clientId)
    }
  }

  private async throwIfNoRoom(roomId: string) {
    if (!(await this.roomStore.get(roomId))) {
      throw Error('no room found for id ' + roomId)
    }
  }

}
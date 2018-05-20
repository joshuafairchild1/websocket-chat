'use strict'

import { logger, randomId } from '../shared/utils'
import ChatMessage from '../shared/model/ChatMessage'
import ConnectPayload from '../shared/model/ConnectPayload'
import MessageType from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import {
  MessageStrategy, ConnectStrategy, DisconnectStrategy, SendChatStrategy,
  SetUsernameStrategy, CreateRoomStrategy, JoinRoomStrategy, LeaveRoomStrategy
} from '../shared/MessageStrategy'
import User from '../shared/model/User'
import { connection, IMessage } from 'websocket'
import RoomChannelRegistry from './RoomChannelRegistry'
import Room from '../shared/model/Room'
import RoomJoinedPayload from '../shared/model/RoomJoinedPayload'

const log = logger('ChatTransport')

class Subscription {
  id = randomId()
  constructor(public connection: connection) {}
}

export default class ChatTransport {

  private allRooms = new Map<string, Room>()
  private subscribers = new Map<string, Subscription>()

  constructor(private readonly channels: RoomChannelRegistry) {
    new ConnectStrategy(this.handleConnect, this)
    new DisconnectStrategy((_: any, message: WebSocketMessage) =>
      this.handleDisconnect(message.payload))
    new SendChatStrategy((_: any, message: WebSocketMessage) =>
      this.handleChatMessage(new ChatMessage(message.clientId,
        message.payload.senderName, message.payload.content), message.roomId))
    new SetUsernameStrategy(this.handleNewUsername, this)
    new CreateRoomStrategy((_: any, message: WebSocketMessage) =>
      this.handleNewRoom(message.payload))
    new JoinRoomStrategy((connection: connection, message: WebSocketMessage) =>
      this.handleJoinRoom(connection, message.payload))
    new LeaveRoomStrategy((_: any, message: WebSocketMessage) =>
      this.handleLeaveRoom(message.clientId, message.roomId))
  }

  registerConnection(connection: connection) {
    connection.on('message', (message: IMessage) => {
      if (message.type === 'utf8' && message.utf8Data) {
        const parsed = WebSocketMessage.fromString(message.utf8Data)
        const type = MessageType.forName(parsed.type)
        log(`received message ${type.name()}`)
        MessageStrategy.callFor(type, connection, parsed)
        return
      }
      throw Error('message did not contain utf8 string data')
    })
  }

  private handleConnect(connection: connection) {
    const sub = new Subscription(connection)
    this.subscribers.set(sub.id, sub)
    log(`new subscriber ${sub.id},`, this.subscribers.size, 'total subscriptions')
    const payload = new ConnectPayload([...this.allRooms.values()], sub.id)
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.newConnection, payload).forTransport())
  }

  private handleDisconnect(subscriptionId: string) {
    this.subscribers.delete(subscriptionId)
    log(`subscription cancelled for subscriber ${subscriptionId},`,
      this.subscribers.size, 'subscriptions remaining')
  }

  private handleChatMessage(message: ChatMessage, roomId: string) {
    this.channelFor(roomId).addMessage(message)
    const wsMessage = new WebSocketMessage(
      MessageType.server.newMessage, message, message.senderId).forTransport()
    this.sendToAllInRoom(roomId, wsMessage)
  }

  private handleNewUsername(connection: connection, message: WebSocketMessage
  ) {
    const { clientId, payload: name, roomId } = message
    const channel = this.channelFor(roomId)
    channel.newUsername(clientId, name)
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.updateUsername, name).forTransport())
    this.sendToAllInRoom(roomId, new WebSocketMessage(
      MessageType.server.updateMessages, channel.getMessages())
        .forTransport())
  }

  private handleNewRoom(room: Room) {
    if (this.allRooms.has(room.id)) {
      throw Error('duplicate room : ' + room.id)
    }
    log('created new room', room.id)
    this.allRooms.set(room.id, room)
    const message = new WebSocketMessage(MessageType.server.newRoom, room)
    this.sendToAllSubscribers(message.forTransport())
  }

  private handleJoinRoom(connection: connection, roomId: string) {
    if (!this.allRooms.has(roomId)) {
      throw Error('no room found for id ' + roomId)
    }
    const channel = this.channels.ensureChannelFor(roomId)
    const { clientId } = channel.newUser(connection)
    const payload = new RoomJoinedPayload(roomId, clientId, channel.getMessages())
    connection.sendUTF(new WebSocketMessage(
      MessageType.server.roomJoined, payload).forTransport())
  }

  private handleLeaveRoom(clientId: string, roomId: string) {
    if (!this.allRooms.has(roomId)) {
      throw Error('no room found for id ' + roomId)
    }
    const channel = this.channelFor(roomId)
    channel.userLeft(clientId)
    if (channel.isActive) {
      this.handleChatMessage(new ChatMessage(
        clientId, 'System', `User ${clientId} has disconnected`), roomId)
    }
  }

  private sendToAllInRoom(roomId: string, message: string) {
    log('sending message to all in room', message)
    this.channelFor(roomId)
      .forEachUser((user: User) => user.connection.sendUTF(message))
  }

  private sendToAllSubscribers(message: string) {
    log('sending message to all subscribers', message)
    this.subscribers.forEach(subscriber =>
      subscriber.connection.sendUTF(message))
  }

  private channelFor(id: string) {
    return this.channels.get(id)
  }

}
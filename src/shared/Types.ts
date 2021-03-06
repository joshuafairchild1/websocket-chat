'use strict'

import ConnectPayload from './model/ConnectPayload'
import ChatMessage from './model/ChatMessage'
import Room from './model/Room'
import RoomJoinedPayload from './model/RoomJoinedPayload'

export type ServerMessagePayload = ConnectPayload
  | RoomJoinedPayload | ChatMessage | ChatMessage[] | String | Room | null

export type ClientMessagePayload = ChatMessage | Room | String | null

export type MessagePayload = ClientMessagePayload | ServerMessagePayload

export interface StringToString {
  [key: string]: string
}

export interface Closeable {
  close: VoidFunction
  isActive: boolean
}
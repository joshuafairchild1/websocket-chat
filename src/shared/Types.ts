'use strict'

import ConnectPayload from './model/ConnectPayload'
import ChatMessage from './model/ChatMessage'
import Room from './model/Room'
import RoomJoinedPayload from './model/RoomJoinedPayload'
import { AppState } from '../client/components/App'

export type ServerMessagePayload = ConnectPayload
  | RoomJoinedPayload | ChatMessage | ChatMessage[] | String | null

export type ClientMessagePayload = ChatMessage | Room | String | null

export type MessagePayload =
  (ClientMessagePayload | ServerMessagePayload) & Partial<AppState>

export interface StringToString {
  [key: string]: string
}

export interface Closeable {
  close: VoidFunction
}
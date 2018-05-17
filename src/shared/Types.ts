'use strict'

import ConnectPayload from './model/ConnectPayload'
import ChatMessage from './model/ChatMessage'

export type ServerMessagePayload = ConnectPayload
  | String | ChatMessage | ChatMessage[] | null

export type ClientMessagePayload = ChatMessage | String | null

export type MessagePayload = ClientMessagePayload | ServerMessagePayload

export interface StringToString {
  [key: string]: string
}
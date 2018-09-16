'use strict'

import Room from '../../shared/model/Room'
import ConnectPayload from '../../shared/model/ConnectPayload'
import ChatMessage from '../../shared/model/ChatMessage'
import RoomJoinedPayload from '../../shared/model/RoomJoinedPayload'

export enum Actions {
  ROOM_JOINED = 'ROOM_JOINED',
  LEAVE_ROOM = 'LEAVE_ROOM',
  NEW_MESSAGE = 'NEW_ MESSAGE',
  NEW_ROOM = 'NEW_ROOM',
  UPDATE_MESSAGES = 'UPDATE_MESSAGES',
  INITIAL_CONNECTION = 'INITIAL_CONNECTION',
  SET_USERNAME = 'SET_USERNAME',
}

interface Action {
  type: Actions
  payload?: any
  callback?: VoidFunction
}

export type StoreAction = Action & {
  payload?: Room
    | ConnectPayload
    | ChatMessage
    | RoomJoinedPayload
    | ChatMessage[]
    | string
}
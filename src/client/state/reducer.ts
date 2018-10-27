'use strict'

import { Actions, StoreAction } from './Action'
import { AppState } from './StateStore'
import { logger } from '../../shared/utils'

const log = logger('RootReducer')

type State = Readonly<AppState>

export type Reducer <S, A> = (state: Readonly<S>, action: A) => Readonly<S>

export default function reduce(state: State = new AppState(), action: StoreAction): State {
  const { type, payload } = action
  const { selectedRoom } = state
  log.debug('reducing action', type, 'with payload: ', payload)
  switch (type) {
    case Actions.LEAVE_ROOM:
      return { ...state, selectedRoom: null, userName: 'Anonymous' }
    case Actions.NEW_ROOM:
      return { ...state, rooms: [...state.rooms, payload] }
    case Actions.INITIAL_CONNECTION:
      return { ...state, ...payload }
    case Actions.NEW_MESSAGE:
      selectedRoom.messages = selectedRoom.messages.concat(payload)
      return { ...state, selectedRoom }
    case Actions.ROOM_JOINED:
      const { roomId, clientId, messages } = payload
      const { rooms } = state
      const room = rooms.find(room => room._id === roomId)
      if (room) {
        room.messages = messages
      } else {
        console.warn('room joined payload contained an unknown room ID:', roomId)
      }
      return { ...state, selectedRoom: room || null, clientId }
    case Actions.UPDATE_MESSAGES:
      selectedRoom.messages = payload
      return { ...state, selectedRoom }
    case Actions.SET_USERNAME:
      return { ...state, userName: payload }
    default: return { ...state }
  }
}
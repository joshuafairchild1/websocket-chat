'use strict'

import { Actions, StoreAction } from './Action'
import { AppState } from './StateStore'
import { logger } from '../../shared/utils'

const log = logger('RootReducer')

type State = Readonly<AppState>

export default function reduce(state: State, action: StoreAction): State {
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
      room.messages = messages
      return { ...state, selectedRoom: room, clientId }
    case Actions.UPDATE_MESSAGES:
      selectedRoom.messages = payload
      return { ...state, selectedRoom }
    case Actions.SET_USERNAME:
      return { ...state, userName: payload }
    default: return { ...state }
  }
}
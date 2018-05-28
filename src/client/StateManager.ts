'use strict'

import { default as App, AppState } from './components/App'
import { scrollMessageList } from '../shared/utils'
import ConnectPayload from '../shared/model/ConnectPayload'
import ChatMessage from '../shared/model/ChatMessage'
import RoomJoinedPayload from '../shared/model/RoomJoinedPayload'
import Room from '../shared/model/Room'

export default class StateManager {

  constructor(private app: App) {
    this.set = this.set.bind(this)
  }

  set(newState: Partial<AppState>): void {
    const { app } = this
    if (!newState) {
      return
    }
    const { selectedRoom, rooms } = this.app.state
    switch (newState.constructor.name) {
      case ConnectPayload.name: return app.setState(newState as AppState)
      case String.name: return app.setState({ userName: newState } as AppState)
      case Room.name: return app.setState({ rooms: [ ...rooms, newState as Room ] })
      case ChatMessage.name: {
        selectedRoom.messages.push(newState as ChatMessage)
        return app.setState({ ...{ selectedRoom }}, scrollMessageList)
      }
      case Array.name: {
        selectedRoom.messages = newState as ChatMessage[]
        return app.setState({ ...{ selectedRoom } })
      }
      case RoomJoinedPayload.name: {
        const { roomId, clientId, messages } = newState as RoomJoinedPayload
        const room = rooms.find(room => room._id === roomId)
        room.messages = messages
        return app.setState({ selectedRoom: room, userName: clientId, clientId },
          scrollMessageList)
      }
      default: return app.setState(newState as any)
    }
  }

}
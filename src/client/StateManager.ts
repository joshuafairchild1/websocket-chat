'use strict'

import { default as App, AppState } from './components/App'
import { scrollMessageList } from '../shared/utils'
import ConnectPayload from '../shared/model/ConnectPayload'
import ChatMessage from '../shared/model/ChatMessage'
import RoomJoinedPayload from '../shared/model/RoomJoinedPayload'
import Room from '../shared/model/Room'

export default class StateManager {

  constructor(private app: App) {}

  set(newState: Partial<AppState>, scrollMessages = false) {
    this.app.setState(
      { ...newState as AppState }, scrollMessages ? scrollMessageList : null)
  }

  handleState = (newState: Partial<AppState>): void =>  {
    if (!newState) {
      return
    }
    const { selectedRoom, rooms } = this.app.state
    switch (newState.constructor.name) {
      case ConnectPayload.name: return this.set(newState)
      case String.name: return this.set({ userName: newState } as AppState)
      case Room.name: return this.set({ rooms: [ ...rooms, newState as Room ] })
      case ChatMessage.name: {
        selectedRoom.messages.push(newState as ChatMessage)
        return this.set({ selectedRoom }, true)
      }
      // array of chat messages
      case Array.name: {
        selectedRoom.messages = newState as ChatMessage[]
        return this.set({ selectedRoom }, true)
      }
      case RoomJoinedPayload.name: {
        const { roomId, clientId, messages } = newState as RoomJoinedPayload
        const room = rooms.find(room => room._id === roomId)
        room.messages = messages
        return this.set(
          { selectedRoom: room, clientId }, true)
      }
      default: return this.set(newState as any)
    }
  }

}
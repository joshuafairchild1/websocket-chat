import * as React from 'react'
import Room from '../../shared/model/Room'
import { Component } from 'react'
import CreateRoom from './CreateRoom'

export interface RoomListProps {
  rooms: Room[]
  sendCreateRoom: (room: Room) => void
  selectRoom: (id: string) => void
}

interface RoomListState {
  isCreatingRoom: boolean
}

export default class RoomList extends Component<RoomListProps, RoomListState> {

  constructor(props: RoomListProps) {
    super(props)
    this.state = { isCreatingRoom: false }
  }

  createRoom(name: string) {
    this.props.sendCreateRoom(new Room(name))
    this.setState({ isCreatingRoom: false })
  }

  render() {
    const { props, state } = this
    return state.isCreatingRoom
      ? <CreateRoom createRoom={this.createRoom.bind(this)} />
      : <div>
          <button onClick={() => this.setState({ isCreatingRoom: true })}>
            Create Room
          </button>
          <ul>{props.rooms.map((room: Room) =>
            <li key={room.id} onClick={() => props.selectRoom(room.id)}>
              {room.name}
            </li>)}
          </ul>
        </div>
  }
}
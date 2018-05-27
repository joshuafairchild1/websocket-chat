import * as React from 'react'
import Room from '../../shared/model/Room'
import { Component, ReactNode } from 'react'
import { Button, Modal } from 'react-materialize'
import ModalForm from './ModalForm'

export interface RoomListProps {
  rooms: Room[]
  sendCreateRoom: (room: Room) => void
  joinRoom: (id: string) => void
}

interface RoomListState {
  isCreatingRoom: boolean
}

export default class RoomList extends Component<RoomListProps, RoomListState> {

  constructor(props: RoomListProps) {
    super(props)
    this.state = { isCreatingRoom: false }
  }

  private set isCreatingRoom(value: boolean) {
    this.setState({ isCreatingRoom: value })
  }

  createRoom(name: string) {
    this.props.sendCreateRoom(new Room(name))
    this.isCreatingRoom = false
  }

  render() {
    const { props } = this
    const { rooms } = props
    const createModal = (trigger: ReactNode) =>
      <ModalForm header='Create a chat room'
                 trigger={trigger}
                 onSubmit={this.createRoom.bind(this)}
                 submitButtonText='Create'
                 cancel={true} />
    if (!rooms.length) {
      return (
        <div>
          <h4>There are currently no rooms</h4>
          {createModal(
            <h4>
              Join one of these rooms, or <span>create another</span>
            </h4>
          )}
        </div>
      )
    }
    return (
      <div className='room-list-container'>
        <div className='room-list-head'>
          {createModal(
            <h4>
              Join one of these rooms, or <span>create another</span>
            </h4>
          )}
        </div>
        <div className='room-links-container'>
            {rooms.map((room: Room) =>
              <h5 className='blue-btn waves waves-light room-link'
                key={room.id}
                onClick={() => props.joinRoom(room.id)}>
                {room.name}
              </h5>)}
        </div>
      </div>
    )
  }
}
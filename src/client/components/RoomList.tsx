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

export default class RoomList extends Component<RoomListProps> {

  constructor(props: RoomListProps) {
    super(props)
    this.state = { isCreatingRoom: false }
  }

  createRoom(name: string) {
    this.props.sendCreateRoom(new Room(name))
  }

  createModal(trigger: ReactNode) {
    return <ModalForm
      header='Create a chat room'
      trigger={trigger}
      onSubmit={this.createRoom.bind(this)}
      submitButtonText='Create'
      cancel={true} />
  }

  render() {
    const { rooms } = this.props
    return (
      <div className='room-list-container'>
        {!rooms.length
          ? <div>
              <h4>There are currently no rooms</h4>
              {this.createModal(<h4 className='create-room-link'>Create one</h4>)}
            </div>
          : <div>
            {this.createModal(
              <h4>
                Join one of these rooms, or
                <span className='create-room-link'>create another</span>
              </h4>)}
            <div className='room-links-container'>
              {rooms.map((room: Room) =>
                <h5 className='blue-btn waves waves-light room-link'
                    key={room._id}
                    onClick={() => this.props.joinRoom(room._id)}>
                  {room.name}
                </h5>)}
            </div>
          </div>}
      </div>
    )
  }
}
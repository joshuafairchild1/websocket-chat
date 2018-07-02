import * as React from 'react'
import Room from '../../../shared/model/Room'
import { Component, ReactNode } from 'react'
import { Button, Modal } from 'react-materialize'
import ModalForm from '../form/ModalForm'
import './RoomList.scss'
import { Link } from 'react-router-dom'

interface RoomListProps {
  rooms: Room[]
  sendCreateRoom: (room: Room) => void
}

export default class RoomList extends Component<RoomListProps> {

  constructor(props: RoomListProps) {
    super(props)
    this.state = { isCreatingRoom: false }
  }

  createModal(trigger: ReactNode) {
    return <ModalForm
      header='Create a chat room'
      trigger={trigger}
      onSubmit={(name: string) => this.props.sendCreateRoom(new Room(name))}
      submitButtonText='Create'
      allowCancel={true}/>
  }

  render() {
    const { rooms } = this.props
    return (
      <div className='room-list-container fade-in'>
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
                <Link to={`/room/${room._id}`} key={room._id}>
                  <h5 className='blue-btn fade-in'>
                    {room.name}
                  </h5>
                </Link>)}
            </div>
          </div>}
      </div>
    )
  }
}
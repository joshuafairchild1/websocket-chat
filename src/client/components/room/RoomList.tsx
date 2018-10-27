import * as React from 'react'
import Room from '../../../shared/model/Room'
import { Component, ReactNode } from 'react'
import { Button, Modal } from 'react-materialize'
import ModalForm from '../form/ModalForm'
import './RoomList.scss'
import { Link } from 'react-router-dom'

interface Props {
  rooms: Room[]
  sendCreateRoom: (room: Room) => void
}

export default class RoomList extends Component<Props> {

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
              {rooms.map(RoomLink)}
            </div>
          </div>}
      </div>
    )
  }

  private createModal(trigger: ReactNode) {
    return <ModalForm
      header='Create a chat room'
      trigger={trigger}
      onSubmit={this.createRoom}
      submitButtonText='Create'
      allowCancel={true}/>
  }

  private createRoom = (name: string) => this.props.sendCreateRoom(new Room(name))
}

const RoomLink: React.SFC<Room> = props =>
  <Link to={`/room/${props._id}`} key={props._id}>
    <h5 className='blue-btn fade-in'>
      {props.name}
    </h5>
  </Link>
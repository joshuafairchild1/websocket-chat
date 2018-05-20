import * as React from 'react'
import Room from '../../shared/model/Room'
import { Component } from 'react'
import CreateRoom from './CreateRoom'
import { Collection } from 'react-materialize'
import { CollectionItem } from 'react-materialize'
import { Button } from 'react-materialize'

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
    const { props, state } = this
    return (
      <div className='room-list-container'>
        {state.isCreatingRoom
          ? <CreateRoom
              createRoom={this.createRoom.bind(this)}
              cancelCreateRoom={() => this.isCreatingRoom = false}/>
          : props.rooms.length
            ? <div>
                <div className='room-list-head'>
                  <h4>Join one of these rooms, or
                    <span className='create-room-btn'
                          onClick={() => this.isCreatingRoom = true}>
                      create another
                    </span>
                  </h4>
                </div>
                <div className='room-links-container'>
                  <Collection>
                    {
                      props.rooms.map((room: Room) =>
                        <CollectionItem
                          className='room-link'
                          key={room.id}
                          onClick={() => props.joinRoom(room.id)}>
                          {room.name}
                        </CollectionItem>
                      )
                    }
                  </Collection>
                </div>
              </div>
            : <div>
                <h4>There are currently no rooms</h4>
                <Button onClick={() => this.isCreatingRoom = true}>
                  Create a room
                </Button>
              </div>
        }
      </div>
    )
  }
}
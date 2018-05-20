'use strict'

import { Component } from 'react'
import * as React from 'react'
import { AppProps, AppState, SetStateCallback } from './App'
import ChatRoom from './ChatRoom'
import RoomList from './RoomList'
import {
  NewConnectionStrategy, NewMessageStrategy, UpdateUsernameStrategy,
  UpdateMessagesStrategy, NewRoomStrategy, RoomJoinedStrategy
} from '../../shared/MessageStrategy'

type AppControllerProps = {
  setState: (state: Partial<AppState>, callback?: SetStateCallback) => void
} & AppProps & Readonly<AppState>

export default class AppController extends Component<AppControllerProps> {

  constructor(props: AppControllerProps) {
    super(props)
  }

  componentDidMount() {
    const { props } = this
    window.addEventListener('beforeunload', () => {
      const room = this.props.selectedRoom
      props.clientMessenger.disconnect(
        this.props.subscriptionId, room && room.id)
    })
    // TODO remove these remaining strategies
    new NewConnectionStrategy(props.setState)
    new NewMessageStrategy(props.setState)
    new UpdateUsernameStrategy(props.setState)
    new UpdateMessagesStrategy(props.setState)
    new NewRoomStrategy(props.setState)
    new RoomJoinedStrategy(props.setState)
  }

  private get roomId(): string | null {
    const { selectedRoom } = this.props
    return selectedRoom && selectedRoom.id || null
  }

  private showAllRooms() {
    const { props } = this
    props.clientMessenger.leaveRoom(this.props.clientId, this.roomId)
    props.setState({ selectedRoom: null })
  }

  render() {
    const { props, roomId } = this
    const { clientMessenger, clientId } = props
    return (
      <div className='app-container'>
        {props.selectedRoom
          ? <ChatRoom
              messages={props.selectedRoom.messages}
              userName={props.userName}
              room={props.selectedRoom}
              changeUsername={(name: string) =>
                clientMessenger.changeUsername(name, clientId, roomId)}
              sendMessage={(text: string) =>
                clientMessenger.sendMessage(
                  text, props.userName, clientId, roomId)}
              showAllRooms={this.showAllRooms.bind(this)}/>
          : <RoomList
              rooms={props.rooms}
              sendCreateRoom={clientMessenger.sendCreateRoom}
              joinRoom={(id: string) => clientMessenger.joinRoom(id)} />
        }
      </div>
    )
  }

}
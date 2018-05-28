'use strict'

import { Component } from 'react'
import * as React from 'react'
import { AppProps, AppState } from './App'
import ChatRoom from './ChatRoom'
import RoomList from './RoomList'

type AppControllerProps = {
  setState: (state: Partial<AppState>, callback?: VoidFunction) => void
} & AppProps & Readonly<AppState>

export default class AppController extends Component<AppControllerProps> {

  constructor(props: AppControllerProps) {
    super(props)
  }

  componentDidMount() {
    this.props.webSocketClient.onMessage(this.props.setState)
    window.addEventListener('beforeunload', () => {
      const { props, roomId } = this
      const { clientId = null, subscriptionId } = props
      props.clientMessenger.disconnect(subscriptionId, clientId, roomId)
    })
  }

  private get roomId(): string | null {
    const { selectedRoom } = this.props
    return selectedRoom && selectedRoom._id || null
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
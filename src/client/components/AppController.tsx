import { Component } from 'react'
import * as React from 'react'
import { AppProps } from './App'
import ChatRoom from './room/ChatRoom'
import RoomList from './room/RoomList'
import { Switch, Route, RouteComponentProps } from 'react-router-dom'
import Loading from './Loading'
import ActionInvoker from '../state/ActionInvoker'

export default class AppController extends Component<AppProps> {
  private actionInvoker = new ActionInvoker(this.props.actions)

  componentDidMount() {
    this.props.webSocketClient.onMessage(this.actionInvoker.invokeFor)
    window.addEventListener('beforeunload', this.disconnectHandler)
  }

  render(): React.ReactNode {
    if (!this.props.webSocketClient.isConnected) {
      return <Loading/>
    }
    return (
      <Switch>
        <Route exact path='/' render={this.renderRoomList}/>
        <Route exact path='/room/:roomId' render={this.renderRoom}/>
      </Switch>
    )
  }

  private renderRoomList = (): React.ReactNode => {
    const { props } = this
    return <RoomList
      rooms={props.rooms}
      sendCreateRoom={props.clientMessenger.sendCreateRoom}/>
  }

  private renderRoom = ({ match }: RouteComponentProps<any>): React.ReactNode => {
    const { props } = this
    return <ChatRoom
      userName={props.userName}
      room={props.selectedRoom}
      changeUsername={this.changeUsername}
      sendMessage={this.sendMessage}
      joinRoom={() => props.clientMessenger.joinRoom(match.params[ 'roomId' ])}
      leaveRoom={this.leaveRoom}/>
  }

  private changeUsername = (name: string) => {
    const { props } = this
    const { roomId } = this
    if (roomId === null) {
      throw Error('no room ID')
    }
    props.clientMessenger.changeUsername(name, props.clientId, this.roomId)
  }

  private sendMessage = (message: string) => {
    const { props } = this
    props.clientMessenger.sendChatMessage(
      message, props.userName, props.clientId, this.roomId)
  }

  private leaveRoom = () => {
    const { props } = this
    props.clientMessenger.leaveRoom(props.clientId, this.roomId)
    props.actions.roomLeft()
  }

  private disconnectHandler = () => {
    const { props, roomId } = this
    const { clientId = null, subscriptionId } = props
    props.clientMessenger.disconnect(subscriptionId, clientId, roomId)
  }

  private get roomId(): string | null {
    const { selectedRoom } = this.props
    return selectedRoom && selectedRoom._id || null
  }
}
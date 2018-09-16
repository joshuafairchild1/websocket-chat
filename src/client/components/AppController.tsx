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
    window.addEventListener('beforeunload', () => {
      const { props, roomId } = this
      const { clientId = null, subscriptionId } = props
      props.clientMessenger.disconnect(subscriptionId, clientId, roomId)
    })
  }

  render() {
    const { props, roomId } = this
    const { clientMessenger, clientId, selectedRoom, userName } = props
    if (!props.webSocketClient.isConnected) {
      return <Loading/>
    }
    return (
      <Switch>
        <Route exact path='/' render={() =>
          <RoomList rooms={props.rooms}
                    sendCreateRoom={clientMessenger.sendCreateRoom}/>}/>
        <Route exact path='/room/:roomId' render={
          ({ match }: RouteComponentProps<any>) =>
            <ChatRoom userName={userName}
                      room={selectedRoom}
                      changeUsername={(name: string) =>
                        clientMessenger.changeUsername(name, clientId, roomId)}
                      sendMessage={(text: string) =>
                        clientMessenger.sendChatMessage(
                          text, props.userName, clientId, roomId)}
                      joinRoom={() =>
                        clientMessenger.joinRoom(match.params[ 'roomId' ])}
                      leaveRoom={() => {
                        clientMessenger.leaveRoom(clientId, roomId)
                        props.actions.roomLeft()
                      }}/>
        }/>
      </Switch>
    )
  }

  private get roomId(): string | null {
    const { selectedRoom } = this.props
    return selectedRoom && selectedRoom._id || null
  }
}
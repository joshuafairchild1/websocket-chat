import './App.css'
import * as React from 'react'
import ChatMessage from '../../shared/model/ChatMessage'
import WebSocketClient from '../WebSocketClient'
import MessageType from '../../shared/MessageType'
import {
  NewConnectionStrategy,
  NewMessageStrategy, NewRoomStrategy, RoomJoinedStrategy,
  UpdateMessagesStrategy, UpdateUsernameStrategy
} from '../../shared/MessageStrategy'
import ConnectPayload from '../../shared/model/ConnectPayload'
import { findElement, scrollToBottom } from '../../shared/utils'
import RoomList from './RoomList'
import Room from '../../shared/model/Room'
import ChatRoom from './ChatRoom'
import RoomJoinedPayload from '../../shared/model/RoomJoinedPayload'

const { client } = MessageType

interface AppProps {
  readonly webSocketClient: WebSocketClient
}

class AppState {
  constructor(
    public rooms: Room[] = [],
    public userName: string = 'Anonymous',
    public selectedRoom: Room | null = null,
    public subscriptionId: string | null = null,
  ) {}
}

const scrollMessageList = () => scrollToBottom(findElement('.message-list'))

export default class App extends React.Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props)
    this.state = new AppState()
    this.changeUsername = this.changeUsername.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.closeSocket = this.closeSocket.bind(this)
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.closeSocket)
    new NewConnectionStrategy(({ rooms, subscriptionId }: ConnectPayload) =>
      this.setState({ rooms, subscriptionId }))
    new NewMessageStrategy((message: ChatMessage) => {
      const { state } = this
      const { selectedRoom } = state
      selectedRoom.messages = selectedRoom.messages.concat(message)
      this.setState({ ...state }, scrollMessageList)
    })
    new UpdateUsernameStrategy((userName: string) =>
      this.setState({ userName }))
    new UpdateMessagesStrategy((messages: ChatMessage[]) => {
      const { state } = this
      const { selectedRoom } = state
      selectedRoom.messages = messages
      this.setState({ ...state })
    })
    new NewRoomStrategy((room: Room) =>
      this.setState({ rooms: [ ...this.state.rooms, room ] }))
    new RoomJoinedStrategy(({ roomId, clientId, messages }: RoomJoinedPayload) => {
      const room = this.state.rooms.find(room => room.id === roomId)
      room.messages = messages
      this.setState({ selectedRoom: room, userName: clientId })
      this.props.webSocketClient.id = clientId
    })
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.closeSocket)
  }

  private get roomId() {
    return this.state.selectedRoom.id
  }

  private sendCreateRoom(room: Room) {
    this.props.webSocketClient.sendMessage(client.createRoom, room)
  }

  private changeUsername(name: string) {
    this.props.webSocketClient.sendMessage(client.setUsername, name, this.roomId)
  }

  private sendMessage(text: string) {
    const { webSocketClient } = this.props
    const message = new ChatMessage(webSocketClient.id, this.state.userName, text)
    webSocketClient.sendMessage(client.sendChat, message, this.roomId)
  }

  private selectRoom(id: string) {
    this.props.webSocketClient.sendMessage(client.joinRoom, id)
  }

  private showAllRooms() {
    this.setState({ selectedRoom: null })
  }

  private closeSocket() {
    const { webSocketClient } = this.props
    const room = this.state.selectedRoom
    if (room && room.id) {
      webSocketClient.sendMessage(client.leaveRoom, null, room.id)
      return
    }
    this.props.webSocketClient.close(this.state.subscriptionId)
  }

  render() {
    const { state } = this
    return state.selectedRoom
      ? <ChatRoom
          messages={state.selectedRoom.messages}
          userName={state.userName}
          room={state.selectedRoom}
          changeUsername={this.changeUsername.bind(this)}
          sendMessage={this.sendMessage.bind(this)}
          showAllRooms={this.showAllRooms.bind(this)} />
      : <RoomList
          rooms={state.rooms}
          sendCreateRoom={this.sendCreateRoom.bind(this)}
          selectRoom={this.selectRoom.bind(this)} />
  }

}
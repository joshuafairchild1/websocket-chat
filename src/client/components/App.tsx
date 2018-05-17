import './App.css'
import * as React from 'react'
import MessageHistory from './MessageHistory'
import ChatForm from './ChatForm'
import ChatMessage from '../../shared/model/ChatMessage'
import WebSocketClient from '../WebSocketClient'
import MessageType from '../../shared/MessageType'
import ChangeUsernameForm from './ChangeUsernameForm'
import {
  NewConnectionStrategy,
  NewMessageStrategy,
  UpdateMessagesStrategy, UpdateUsernameStrategy
} from '../../shared/MessageStrategy'
import ConnectPayload from '../../shared/model/ConnectPayload'
import { findElement, scrollToBottom } from '../../shared/utils'

const { client } = MessageType

interface AppProps {
  readonly webSocketClient: WebSocketClient
}

interface AppState {
  messages: ChatMessage[]
  name: string
}

const scrollMessageList = () => scrollToBottom(findElement('.message-list'))

export default class App extends React.Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props)
    this.state = { messages: [], name: 'Anonymous' }
    this.changeUsername = this.changeUsername.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
  }

  componentDidMount() {
    new NewConnectionStrategy((payload: ConnectPayload) => {
      this.props.webSocketClient.id = payload.clientId
      this.setState(
        { messages: payload.messages, name: payload.clientId }, scrollMessageList)
    })
    new NewMessageStrategy((message: ChatMessage) => {
      this.setState(
        { messages: [ ...this.state.messages, message ] }, scrollMessageList)
    })
    new UpdateUsernameStrategy((name: string) => {
      this.setState({ name })
    })
    new UpdateMessagesStrategy((messages: ChatMessage[]) => {
      this.setState({ messages })
    })
  }

  private changeUsername(name: string) {
    this.props.webSocketClient.sendMessage(client.setUsername, name)
  }

  private sendMessage(text: string) {
    const { webSocketClient } = this.props
    const message = new ChatMessage(webSocketClient.id, this.state.name, text)
    webSocketClient.sendMessage(client.sendChat, message)
  }

  render() {
    const { state } = this
    return (
      <div className="chat-container">
        <h1>What people are saying:</h1>
        <h5>Chatting as {this.state.name}</h5>
        <ChangeUsernameForm changeUsername={this.changeUsername}/>
        <MessageHistory messages={state.messages}/>
        <ChatForm sendMessage={this.sendMessage}/>
      </div>
    )
  }

}
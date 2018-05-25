import ChangeUsernameForm from './ChangeUsernameForm'
import MessageHistory from './MessageHistory'
import ChatForm from './ChatForm'
import ChatMessage from '../../shared/model/ChatMessage'
import * as React from 'react'
import Room from '../../shared/model/Room'

type ChatRoomProps = {
  userName: string
  messages: ChatMessage[]
  room: Room
  changeUsername: (name: string) => void
  sendMessage: (text: string) => void
  showAllRooms: VoidFunction
}

const ChatRoom: React.SFC<ChatRoomProps> = props =>
  <div className='chat-container'>
    <button onClick={props.showAllRooms}>Back to all rooms</button>
    <h1>{props.room.name}: what people are saying:</h1>
    <h5>Chatting as {props.userName}</h5>
    <ChangeUsernameForm changeUsername={props.changeUsername}/>
    <MessageHistory messages={props.messages}/>
    <ChatForm sendMessage={props.sendMessage}/>
  </div>

export default ChatRoom
import ChangeUsername from './ChangeUsername'
import MessageHistory from './MessageHistory'
import ChatForm from './ChatForm'
import ChatMessage from '../../shared/model/ChatMessage'
import * as React from 'react'
import Room from '../../shared/model/Room'
import { Button } from 'react-materialize'

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
    <Button onClick={props.showAllRooms} className='blue-btn'>
      Back to all rooms
    </Button>
    <h1>{props.room.name}</h1>
    <div className='message-container'>
      <div className='identity'>
        <h5>Chatting as {props.userName}</h5>
        <ChangeUsername changeUsername={props.changeUsername}/>
      </div>
      <MessageHistory messages={props.messages}/>
      <ChatForm sendMessage={props.sendMessage}/>
    </div>
  </div>

export default ChatRoom
import MessageList from '../message/MessageList'
import ChatForm from '../message/ChatForm'
import * as React from 'react'
import { Button } from 'react-materialize'
import ModalForm from '../ModalForm'
import './ChatRoom.scss'
import { Link } from 'react-router-dom'
import Room from '../../../shared/model/Room'
import Loading from '../Loading'

type Props = {
  room: Room
  userName: string
  changeUsername: (name: string) => void
  sendMessage: (text: string) => void
  joinRoom: () => void
  leaveRoom: () => void
}

const ChatRoom: React.SFC<Props> = props => {

  // TODO: ugh, hook typings not available yet?
  (React as any).useEffect(() => {
    props.joinRoom()
    return props.leaveRoom
  }, [])

  const { room } = props

  return !room ? <Loading/> : (
    <div className='chat-container fade-in'>
      <Link to="/">
        <Button className='blue-btn'>
          Back to all rooms
        </Button>
      </Link>
      <h1>{room.name}</h1>
      <div className='message-container'>
        <div className='identity'>
          <h5>Chatting as {props.userName}</h5>
          <ModalForm header='New Username'
                     trigger={<Button className='blue-btn'>Change</Button>}
                     onSubmit={props.changeUsername}
                     submitButtonText='OK'
                     allowCancel={true}/>
        </div>
        <MessageList messages={room.messages}/>
        <ChatForm sendMessage={props.sendMessage}/>
      </div>
    </div>
  )
}

export default ChatRoom
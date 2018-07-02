'use strict'

import MessageList from '../message/MessageList'
import ChatForm from '../message/ChatForm'
import * as React from 'react'
import { Button } from 'react-materialize'
import ModalForm from '../form/ModalForm'
import './ChatRoom.scss'
import { Component } from 'react'
import { Link } from 'react-router-dom'
import Room from '../../../shared/model/Room'
import Loading from '../Loading'

type ChatRoomProps = {
  room: Room
  userName: string
  changeUsername: (name: string) => void
  sendMessage: (text: string) => void
  joinRoom: () => void
  leaveRoom: () => void
}

export default class ChatRoom extends Component<ChatRoomProps> {

  componentDidMount() {
    this.props.joinRoom()
  }

  componentWillUnmount() {
    this.props.leaveRoom()
  }

  render() {
    const { props } = this
    const { room } = props
    if (!room) {
      return <Loading/>
    }
    return (
      <div className='chat-container'>
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

}
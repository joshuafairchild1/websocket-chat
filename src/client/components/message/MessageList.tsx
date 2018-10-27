import * as React from 'react'
import ChatMessage from '../../../shared/model/ChatMessage'
import './MessageList.scss'
import MessageDisplay from './MessageDisplay'

interface MessageListProps {
  messages: ChatMessage[]
}

const MessageList: React.SFC<MessageListProps> = props =>
  <div className='message-list'>
    {props.messages.map(MessageDisplay)}
  </div>

export default MessageList
import * as React from 'react'
import ChatMessage from '../../shared/model/ChatMessage'
import * as moment from 'moment'

interface MessageListProps {
  messages: ChatMessage[]
}

const MessageList: React.SFC<MessageListProps> = props =>
  <div className='message-list'>
    {props.messages.map((message, index) =>
      <p key={message.timestamp + index}
         className='chat-message'>
        {message.senderName || message.senderId} (
        {moment(message.timestamp).fromNow()}): {message.content}
      </p>)}
  </div>

export default MessageList
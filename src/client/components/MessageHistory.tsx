import * as React from 'react'
import ChatMessage from '../../shared/model/ChatMessage'
import * as moment from 'moment'

interface MessageHistoryProps {
  messages: ChatMessage[]
}

const MessageHistory: React.SFC<MessageHistoryProps> = props =>
  <div className="message-list">
    {props.messages.map(message =>
      <p key={message.timestamp}
         className="chat-message">
        {message.senderName || message.senderId}
          ({moment(message.timestamp).fromNow()}): {message.content}
      </p>)}
  </div>

export default MessageHistory
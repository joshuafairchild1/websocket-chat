import * as React from 'react'
import * as moment from 'moment'
import ChatMessage from '../../../shared/model/ChatMessage'

const MessageDisplay: React.SFC<ChatMessage> = props =>
  <p key={props.timestamp}
     className='chat-message fade-in'>
    {props.senderName || props.senderId} (
    {moment(props.timestamp).fromNow()}): {props.content}
  </p>

export default MessageDisplay
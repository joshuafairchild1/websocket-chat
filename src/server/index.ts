'use strict'

import ChatTransport from './ChatTransport'
import Application from './Application'
import ChatRoom from './ChatRoom'
import MessageRegistry from './MessageRegistry'


const messageRegistry = new MessageRegistry()
const room = new ChatRoom(messageRegistry)
const transport = new ChatTransport(room)

new Application(transport)
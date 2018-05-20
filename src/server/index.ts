'use strict'

import MessageTransport from './MessageTransport'
import Application from './Application'
import RoomChannelRegistry from './RoomChannelRegistry'


const rooms = new RoomChannelRegistry()
const transport = new MessageTransport(rooms)

new Application(transport)
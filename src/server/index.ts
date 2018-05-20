'use strict'

import ChatTransport from './ChatTransport'
import Application from './Application'
import RoomChannelRegistry from './RoomChannelRegistry'


const rooms = new RoomChannelRegistry()
const transport = new ChatTransport(rooms)

new Application(transport)
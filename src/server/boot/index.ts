'use strict'

import MessageTransport from '../messaging/MessageTransport'
import Application from './Application'
import RoomChannelRegistry from '../room/RoomChannelRegistry'
import RoomStore from '../store/RoomStore'

(async () => {
  try {
    const channels = new RoomChannelRegistry()
    const rooms = await new RoomStore().initializeCollection() /* ugh */ as RoomStore
    const transport = new MessageTransport(channels, rooms)
    new Application(transport)
  } catch (ex) {
    console.log('STARTUP ERROR:', ex)
  }
})()
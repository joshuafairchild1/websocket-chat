'use strict'

import MessageTransport from '../messaging/MessageTransport'
import Application from './Application'
import RoomChannelRegistry from '../room/RoomChannelRegistry'
import RoomStore from '../store/RoomStore'
import MessageHandler from '../messaging/MessageHandler'
import { logger } from '../../shared/utils'
import MessageStore from '../store/MessageStore'

const log = logger('Startup')
const startup = 'server startup took'

;(async () => {
  log.time(startup)
  try {
    const channels = new RoomChannelRegistry()
    const transport = new MessageTransport(channels)
    const roomStore = await new RoomStore().initializeCollection<RoomStore>()
    const messageStore = await new MessageStore().initializeCollection<MessageStore>()
    // hooks into the transport on instantiation
    new MessageHandler(transport, roomStore, messageStore)
    new Application(transport)
  } catch (ex) {
    log.error('STARTUP ERROR:', ex)
  } finally {
    log.timeEnd(startup)
  }
})()
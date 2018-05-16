'use strict'

import * as http from 'http'
import * as WebSocketServer from 'websocket'
import ChatTransport from './ChatTransport'
import { APP_PORT, logger } from '../shared/utils'
import { request } from 'websocket'

const log = logger('Http Server')

const transport = new ChatTransport()

const httpServer = http.createServer()
  .listen(APP_PORT, () => log(new Date(), 'listening on port', APP_PORT))

const wsServer = new WebSocketServer.server({ httpServer })
wsServer.on('request', (request: request) =>
  transport.registerConnection(request.accept(null, request.origin)))


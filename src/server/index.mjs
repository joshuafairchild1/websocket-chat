'use strict'

import http from 'http'
import fs from 'fs'
import WebSocketServer from 'websocket'
import ChatTransport from './ChatTransport'
import { APP_PORT, logger } from '../shared/utils'

const log = logger('Http Server')
const INDEX_PATH =  '/Users/joshua/Desktop/Projects/ws-chat/dist/index.html'

const transport = new ChatTransport()

const httpServer = http.createServer((request, response) => {
  log('reading file', INDEX_PATH)
  fs.readFile(INDEX_PATH, (error, content) => {
    if (error) {
      log('error reading file', INDEX_PATH, error)
      return
    }
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(content, 'utf-8')
  })
}).listen(APP_PORT, () => log(new Date(), 'listening on port', APP_PORT))

const wsServer = new WebSocketServer.server({ httpServer })
wsServer.on('request', request =>
  transport.registerConnection(request.accept(null, request.origin)))


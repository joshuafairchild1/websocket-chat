'use strict'

import MessageTransport from '../messaging/MessageTransport'
import * as fs from 'fs'
import { APP_PORT, logger } from '../../shared/utils'
import * as http from 'http'
import { IncomingMessage, ServerResponse } from 'http'
import { StringToString } from '../../shared/Types'
import * as WebSocketServer from 'websocket'
import { request } from 'websocket'

const log = logger('Http Server')
const BUNDLE = '/Users/joshua/Desktop/Projects/ws-chat/dist/bundle.js'
const INDEX = '/Users/joshua/Desktop/Projects/ws-chat/public/index.html'
const SERVED_FILES: StringToString = {
  '/': INDEX,
  '/dist/bundle.js': BUNDLE
}

export default class Application {

  constructor(private readonly transport: MessageTransport) {
    const httpServer = http.createServer(this.requestListener)
    const wsServer = new WebSocketServer.server({ httpServer })
    httpServer.listen(APP_PORT,
      () => log.info(new Date(), 'listening on port', APP_PORT))
    wsServer.on('request', this.wsRequestListener)
  }

  private requestListener = (request: IncomingMessage, response: ServerResponse) => {
    const { url } = request
    log.info('request received for', url)
    const path: string = SERVED_FILES[url] || INDEX
    fs.readFile(path, (error, content) => {
      if (error) {
        log.error('error reading file', path, error)
        return
      }
      response.writeHead(200, { 'Content-Type': 'text/html' })
      response.end(content, 'utf-8')
    })
  }

  private wsRequestListener = (request: request) =>
    this.transport.registerConnection(request.accept(null, request.origin))

}


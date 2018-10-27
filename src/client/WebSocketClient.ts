'use strict'

import { APP_PORT, logger, makeHandlerHelper }
  from '../shared/utils'
import MessageType from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import { ClientMessagePayload, Closeable } from '../shared/Types'

const STARTUP_TIMEOUT = 5 * 1000
export enum WS_READY_STATES {
  // noinspection JSUnusedGlobalSymbols
  CONNECTING, OPEN, CLOSING, CLOSED }

const log = logger('WebSocketClient')

type MessageHandler = (event: MessageEvent) => void

export default class WebSocketClient implements Closeable {
  isConnected = false

	constructor(private readonly socket: WebSocket) {
    const handle = makeHandlerHelper(socket, 'addEventListener', this)
    handle('message', this.handleMessage)
    handle('open', this.onOpen)
    handle('error', (ex: ErrorEvent) => log.error('web socket exception:', ex))
		setTimeout(() => {
			if (socket.readyState !== WS_READY_STATES.OPEN) {
				log.error('web socket could not make a connection after five seconds')
			}
		}, STARTUP_TIMEOUT)
	}

  get isActive() {
    return !!this.onMessageHandler
  }

	sendMessage(
	  type: MessageType, payload: ClientMessagePayload = null,
    clientId: string | null = null, roomId: string | null = null
  ) {
	  if (!clientId && type.requiresClientId()) {
	    throw Error('client ID is required to send message of type ' + type.name)
    }
    if (!roomId && type.requiresRoomId()) {
      throw Error('room ID is required to send message of type ' + type.name)
    }
		const message = new WebSocketMessage(
		  type, payload, clientId, roomId).forTransport()
		log.info('sending message', message)
		this.socket.send(message)
	}

	onMessage(handleMessage: (wsMessage: WebSocketMessage) => void) {
	  this.onMessageHandler = (message: MessageEvent) => {
      const { data, origin } = message
      if (origin !== 'ws://localhost:' + APP_PORT) {
        log.warn('message received from non-local origin', message)
        return
      }
      const wsMessage = WebSocketMessage.fromString(data)
      log.info(`received message "${wsMessage.type}"`)
      handleMessage(wsMessage)
    }
  }

	close() {
    this.socket.close()
  }

  private handleMessage(message: MessageEvent) {
	  if (!this.isActive) {
	    throw Error('cannot handle incoming message, "onMessage" was never called')
    }
    this.onMessageHandler(message)
  }

	private onOpen() {
    this.isConnected = true
	  log.info('web socket connection opened')
		this.sendMessage(MessageType.client.connect)
	}

  private onMessageHandler: MessageHandler | null = null

}
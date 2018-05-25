'use strict'

import { APP_PORT, logger, makeHandlerHelper }
  from '../shared/utils'
import MessageType from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import { ClientMessagePayload, Closeable, MessagePayload } from '../shared/Types'

const STARTUP_TIMEOUT = 5 * 1000
export enum WS_READY_STATES {
  // noinspection JSUnusedGlobalSymbols
  CONNECTING, OPEN, CLOSING, CLOSED }

const log = logger('WebSocketClient')

export default class WebSocketClient implements Closeable {

  private onMessageHandler: Function | null = null

	constructor(private readonly socket: WebSocket) {
    const handle = makeHandlerHelper(socket, 'addEventListener', this)
    handle('message', this.handleMessage)
    handle('open', this.onOpen)
    handle('error', (ex: ErrorEvent) => console.error('web socket exception:', ex))
		setTimeout(() => {
			if (socket.readyState !== WS_READY_STATES.OPEN) {
				console.error('web socket could not make a connection after five seconds')
			}
		}, STARTUP_TIMEOUT)
	}

	sendMessage(
	  type: MessageType, payload: ClientMessagePayload = null,
    clientId: string | null = null, roomId: string | null = null
  ) {
	  if (!clientId && type.requiresClientId()) {
	    throw Error('client ID is required to send message of type ' + type.name())
    }
    if (!roomId && type.requiresRoomId()) {
      throw Error('room ID is required to send message of type ' + type.name())
    }
		const message = new WebSocketMessage(
		  type, payload, clientId, roomId).forTransport()
		log('sending message', message)
		this.socket.send(message)
	}

	onMessage(handlePayload: (payload: MessagePayload) => void) {
	  this.onMessageHandler = (message: MessageEvent) => {
      const { data, origin } = message
      if (origin !== 'ws://localhost:' + APP_PORT) {
        log('message received from non-local origin', message)
        return
      }
      const { type, payload } = WebSocketMessage.fromString(data)
      log(`received message "${type}"`)
      handlePayload(payload)
    }
  }

	close() {
    this.socket.close()
  }

  private handleMessage(message: MessageEvent) {
	  if (!this.onMessageHandler) {
	    throw Error('cannot handle incoming message, "onMessage" was never called')
    }
    this.onMessageHandler(message)
  }

	private onOpen() {
	  log('web socket connection opened')
		this.sendMessage(MessageType.client.connect)
	}

}
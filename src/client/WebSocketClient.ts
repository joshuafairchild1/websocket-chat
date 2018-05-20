'use strict'

import { APP_PORT, logger, makeHandlerHelper }
  from '../shared/utils'
import { MessageStrategy } from '../shared/MessageStrategy'
import MessageType from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import { ClientMessagePayload, Closeable } from '../shared/Types'

const STARTUP_TIMEOUT = 5 * 1000
export enum WS_READY_STATES {
  // noinspection JSUnusedGlobalSymbols
  CONNECTING, OPEN, CLOSING, CLOSED }

const log = logger('WebSocketClient')

function callStrategy(message: MessageEvent) {
  const { data, origin } = message
  if (origin !== 'ws://localhost:' + APP_PORT) {
    log('message received from non-local origin', message)
    return
  }
  const { type, payload } = WebSocketMessage.fromString(data)
  log(`received message "${type}"`)
  MessageStrategy.callFor(MessageType.forName(type), payload)
}

export default class WebSocketClient implements Closeable {
  private _id: string | null

	constructor(private readonly socket: WebSocket) {
    const handle = makeHandlerHelper(socket, 'addEventListener', this)
    handle('message', callStrategy)
    handle('open', this.onOpen)
    handle('error', (ex: ErrorEvent) => console.error('web socket exception:', ex))
		setTimeout(() => {
			if (socket.readyState !== WS_READY_STATES.OPEN) {
				console.error('web socket could not make a connection after five seconds')
			}
		}, STARTUP_TIMEOUT)
	}

	set id(clientId: string) {
	  this._id = clientId
  }

  get id() {
	  return this._id
  }

	sendMessage(
	  type: MessageType, payload: ClientMessagePayload = null,
    roomId: string | null = null
  ) {
	  if (!this._id && type.requiresClientId()) {
	    throw Error('client ID is required to send message of type ' + type.name())
    }
		const message = new WebSocketMessage(
		  type, payload, this._id, roomId).forTransport()
		log('sending message', message)
		this.socket.send(message)
	}

	close() {
    this.socket.close()
  }

	private onOpen() {
	  log('web socket connection opened')
		this.sendMessage(MessageType.client.connect)
	}

}
'use strict'

import { APP_PORT, logger, makeHandlerHelper }
  from '../shared/utils'
import { MessageStrategy } from '../shared/MessageStrategy'
import MessageType from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'

const STARTUP_TIMEOUT = 5 * 1000
const WS_READY_STATES = {
	CONNECTING: 0,
	OPEN:	1,
	CLOSING: 2,
	CLOSED: 3
}

const log = logger('WebSocketClient')

function callStrategy(message: MessageEvent) {
  const { data, origin } = message
  if (origin !== 'ws://localhost:' + APP_PORT) {
    log('message received from non-local origin', message)
    return
  }
  const { type, payload } = WebSocketMessage.fromString(data)
  log(`received message "${message && message.type}"`)
  MessageStrategy.callFor(MessageType.forName(type), payload)
}

export default class WebSocketClient {
  private readonly socket: WebSocket
  private _id: string | null

	constructor(port: number) {
		const socket = this.socket = new WebSocket(`ws://localhost:${port}`)
    const handle = makeHandlerHelper(socket, 'addEventListener', this)
    handle('message', callStrategy)
    handle('open', this._onOpen)
    handle('close', this._onClose)
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

	sendMessage(type: MessageType, payload: ClientMessagePayload = null) {
	  if (!this._id && type !== MessageType.client.connect) {
	    throw Error('client ID is required to send a message')
    }
		const message = new WebSocketMessage(type, payload, this._id).forTransport()
		log('sending message', message)
		this.socket.send(message)
	}

	_onOpen() {
	  log('web socket connection opened')
		this.sendMessage(MessageType.client.connect)
	}

	_onClose() {
    log('web socket connection closed')
		this.sendMessage(MessageType.client.disconnect)
	}

}
'use strict'

import MESSAGE_TYPE from '../shared/MessageType'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import { APP_PORT, makeHandlerHelper, toJson } from '../shared/utils'

const STARTUP_TIMEOUT = 5 * 1000
const WS_READY_STATES = {
	CONNECTING: 0,
	OPEN:	1,
	CLOSING: 2,
	CLOSED: 3
}


export default class WebSocketClient {
	constructor(port) {
		const socket = this._socket = new WebSocket(`ws://localhost:${port}`)
    const handle = makeHandlerHelper(socket, 'addEventListener', this)
    handle('open', this._onOpen)
    handle('message', this._onMessage)
    handle('close', this._onClose)
    handle('error', ex => console.error('web socket exception:', ex))
		setTimeout(() => {
			if (socket.readyState !== WS_READY_STATES.OPEN) {
				console.error('web socket could not make a connection after five seconds')
			}
		}, STARTUP_TIMEOUT)
		this._messageHandlers = new Map()
    this._id = null
	}

	setId(clientId) {
	  this._id = clientId
  }

	addMessageHandler(type, handler, receiver = null) {
		if (!MESSAGE_TYPE.server[type]) {
			throw Error('invalid message type: ' + type)
		}
		this._messageHandlers.set(type, handler.bind(receiver))
	}

	_onOpen() {
		this.sendMessage(MESSAGE_TYPE.client.connect)
	}

	_onClose() {
		this.sendMessage(MESSAGE_TYPE.client.disconnect)
	}

	sendMessage(type, payload = null) {
	  if (!this._id && type !== MESSAGE_TYPE.client.connect) {
	    throw Error('client ID is required to send a message')
    }
		const message = new WebSocketMessage(type, payload, this._id).forTransport()
		console.log('sending message', message)
		this._socket.send(message)
	}

	_onMessage(messageEvent) {
		const { data, origin } = messageEvent
		if (origin !== 'ws://localhost:' + APP_PORT) {
			console.warn('message received from non-local origin', origin)
			return
		}
		console.log('received message', data)
		const { type, payload } = toJson(data)
		this._handlerFor(type)(payload)
	}

	_handlerFor(type) {
		const handler = this._messageHandlers.get(type)
		if (!handler) {
			throw Error('no handler for message type ' + type)
		}
		return handler
	}
	
}
'use strict'

import WebSocketMessage from '../shared/model/WebSocketMessage'
import { APP_PORT, ensure, logger, makeHandlerHelper, toJson }
  from '../shared/utils'
import MessageType from '../shared/MessageType'

const STARTUP_TIMEOUT = 5 * 1000
const WS_READY_STATES = {
	CONNECTING: 0,
	OPEN:	1,
	CLOSING: 2,
	CLOSED: 3
}

const log = logger('WebSocketClient')

export default class WebSocketClient {
	constructor(port) {
	  ensure(port, Number, 'port number')
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

	set id(clientId) {
	  ensure(clientId, String, 'client ID')
	  this._id = clientId
  }

  get id() {
	  return this._id
  }

  /**
   * @param type {string}
   * @param handler {Function}
   * @param receiver {*}
   */
	addMessageHandler(type, handler, receiver = null) {
	  ensure(type, String, 'message type name')
    ensure(handler, Function, 'handler function')
    MessageType.validate(type)
		this._messageHandlers.set(type, handler.bind(receiver))
	}

	_onOpen() {
	  log('web socket connection opened')
		this.sendMessage(MessageType.client.connect)
	}

	_onClose() {
    log('web socket connection closed')
		this.sendMessage(MessageType.client.disconnect)
	}

  /**
   * @param type {MessageType}
   * @param payload {*|null}
   */
	sendMessage(type, payload = null) {
	  ensure(type, MessageType, 'message type')
	  if (!this._id && type !== MessageType.client.connect) {
	    throw Error('client ID is required to send a message')
    }
		const message = new WebSocketMessage(type, payload, this._id).forTransport()
		log('sending message', message)
		this._socket.send(message)
	}

	_onMessage(messageEvent) {
		const { data, origin } = messageEvent
		if (origin !== 'ws://localhost:' + APP_PORT) {
			log('message received from non-local origin', origin)
			return
		}
		log('received message', data)
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
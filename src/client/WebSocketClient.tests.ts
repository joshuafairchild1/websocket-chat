'use strict'

import { assert } from 'chai'
import WebSocketClient, { WS_READY_STATES } from './WebSocketClient'
import { EventEmitter } from 'events'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import MessageType from '../shared/MessageType'

class MockSocket extends EventEmitter {
  invocations: string[] = []
  isClosed = false
  // noinspection JSUnusedGlobalSymbols - required for testing
  readyState = WS_READY_STATES.OPEN

  // noinspection JSUnusedGlobalSymbols - required for testing
  addEventListener(event: string, handler: (...args: any[]) => void) {
    this.on(event, handler)
  }

  // noinspection JSUnusedGlobalSymbols - required for testing
  send(message: string) {
    this.invocations.push(message)
  }

  // noinspection JSUnusedGlobalSymbols - required for testing
  close() {
    this.isClosed = true
  }

}

describe('WebSocketClient', function() {

  let socket: MockSocket
  let uut: WebSocketClient

  beforeEach(function() {
    socket = new MockSocket()
    uut = new WebSocketClient(socket as any as WebSocket)
  })

  it('sends connect message when the socket connection opens', function() {
    socket.emit('open')
    const { invocations } = socket
    const expected = new WebSocketMessage(
      MessageType.client.connect, null, null).forTransport()
    assert.equal(invocations[0], expected)
  })

})
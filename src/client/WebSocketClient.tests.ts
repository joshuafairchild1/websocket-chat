'use strict'

import { assert } from 'chai'
import WebSocketClient from './WebSocketClient'
import { EventEmitter } from 'events'
import WebSocketMessage from '../shared/model/WebSocketMessage'
import MessageType from '../shared/MessageType'
import { APP_PORT } from '../shared/utils'

class MockSocket extends EventEmitter {
  invocations: string[] = []

  // noinspection JSUnusedGlobalSymbols - required for testing
  addEventListener(event: string, handler: (...args: any[]) => void) {
    this.on(event, handler)
  }

  // noinspection JSUnusedGlobalSymbols - required for testing
  send(message: string) {
    this.invocations.push(message)
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

  it('throws when message comes in but no handler was provided', function () {
    assert.throws(
      () => socket.emit('message'),
      'cannot handle incoming message, "onMessage" was never called')
  })

  it('calls the handler provided to onMessage', function (done) {
    const message = new WebSocketMessage(MessageType.client.setUsername, 'name')
    const messageEvent = {
      data: message.forTransport(),
      origin: 'ws://localhost:' + APP_PORT,
    }
    uut.onMessage(emitted => {
      assert.deepEqual(emitted, message)
      done()
    })
    socket.emit('message', messageEvent)
  })
})
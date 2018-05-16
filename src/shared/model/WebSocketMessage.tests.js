'use strict'

import assert from 'assert'
import WebSocketMessage from './WebSocketMessage.ts'
import MessageType from '../MessageType.ts'
import ChatMessage from './ChatMessage.ts'
import ConnectPayload from './ConnectPayload.ts'

const { server, client } = MessageType

describe('WebSocketMessage', function () {

  it('validates message payload', function () {
    const validate = (type, payload) =>
      WebSocketMessage.validatePayload(type, payload)
    validate(server.newConnection.name, new ConnectPayload('someId', []))
    validate(server.newMessage.name, new ChatMessage('someId', 'Name', 'Hello'))
    validate(server.updateUsername.name, 'new username')
    validate(server.updateMessages.name, [])
    validate(client.sendChat.name, new ChatMessage('someId', 'Name', 'bonjour'))
    validate(client.setUsername.name, 'Username')
  })

  it('constructs a message from a string', function () {
    const message = new WebSocketMessage(
      client.sendChat, new ChatMessage('someId', 'someName', 'Hello'))
    const asString = JSON.stringify(message)
    const asMessage = WebSocketMessage.fromString(asString)
    assert.deepEqual(asMessage, message)
  })

})
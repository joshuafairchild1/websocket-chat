'use strict'

import assert from 'assert'
import WebSocketMessage from './WebSocketMessage.mjs'
import MessageType from '../MessageType.mjs'
import ChatMessage from './ChatMessage.mjs'
import ConnectPayload from './ConnectPayload.mjs'

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
    const asMessage = WebSocketMessage.fromString(asString, 'client')
    assert.deepEqual(asMessage, message)
  })

})
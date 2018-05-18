'use strict'

import { assert } from 'chai'
import MessageType from '../MessageType'
import { MessagePayload } from '../Types'
import WebSocketMessage from './WebSocketMessage'
import ConnectPayload from './ConnectPayload'
import ChatMessage from './ChatMessage'

const { server, client } = MessageType

describe('WebSocketMessage', function () {

  it('validates message payload', function () {
    const validate = (type: string, payload: MessagePayload) =>
      WebSocketMessage.validatePayload(type, payload)
    validate(server.newConnection.name(), new ConnectPayload('someId', []))
    validate(server.newMessage.name(), new ChatMessage('someId', 'Name', 'Hello'))
    validate(server.updateUsername.name(), 'new username')
    validate(server.updateMessages.name(), [])
    validate(client.sendChat.name(), new ChatMessage('someId', 'Name', 'bonjour'))
    validate(client.setUsername.name(), 'Username')
    assert.throws(
      () => validate(server.newConnection.name(),
        new ChatMessage('someId', 'Name', 'Hello')),
      'payload not of type')
  })

  it('constructs messages from a string', function () {
    const clientId = 'someId'
    const clientName = 'someName'
    const chat = new ChatMessage(clientId, clientName, 'Hello')
    const sendChatMessage = new WebSocketMessage(client.sendChat, chat)
    const asString = JSON.stringify(sendChatMessage)
    const asMessage = WebSocketMessage.fromString(asString)
    assert.deepEqual(asMessage, sendChatMessage)
    
    const newConnectMessage = new WebSocketMessage(
      server.newConnection, new ConnectPayload(clientId, [ chat ]))
    const asString2 = JSON.stringify(newConnectMessage)
    const asMessage2 = WebSocketMessage.fromString(asString2)
    assert.deepEqual(asMessage2, newConnectMessage)

    const disconnectMessage = new WebSocketMessage(
      client.disconnect, null, clientId)
    const asString3 = JSON.stringify(disconnectMessage)
    const asMessage3 = WebSocketMessage.fromString(asString3)
    assert.deepEqual(asMessage3, disconnectMessage)
  })

})
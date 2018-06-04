'use strict'

import { assert } from 'chai'
import MessageType from '../MessageType'
import { MessagePayload } from '../Types'
import WebSocketMessage from './WebSocketMessage'
import ConnectPayload from './ConnectPayload'
import ChatMessage from './ChatMessage'
import Room from './Room'
import TimeSource from '../TimeSource'

const { server, client } = MessageType

describe('WebSocketMessage', function () {

  it('validates message payload', function () {
    const validate = (type: string, payload: MessagePayload) =>
      WebSocketMessage.validatePayload(type, payload)
    validate(server.newConnection.name, new ConnectPayload([], 'subscriptionId'))
    validate(server.newMessage.name, new ChatMessage('someId', 'Name', 'Hello'))
    validate(server.updateUsername.name, 'new username')
    validate(server.updateMessages.name, [])
    validate(client.sendChat.name, new ChatMessage('someId', 'Name', 'bonjour'))
    validate(client.setUsername.name, 'Username')
    assert.throws(
      () => validate(server.newConnection.name,
        new ChatMessage('someId', 'Name', 'Hello')),
      'payload not of type')
  })

  it('constructs messages from a string', function () {
    TimeSource.set()
    const clientId = 'someId'
    const clientName = 'someName'
    const subscriptionId = 'someSubscriptionId'
    const room = new Room('best room')
    const chat = new ChatMessage(clientId, clientName, 'Hello')
    const sendChatMessage = new WebSocketMessage(client.sendChat, chat)
    const asString = JSON.stringify(sendChatMessage)
    const asMessage = WebSocketMessage.fromString(asString)
    assert.deepEqual(asMessage, sendChatMessage)

    const newConnectMessage = new WebSocketMessage(
      server.newConnection, new ConnectPayload([ room ], subscriptionId))
    const asString2 = JSON.stringify(newConnectMessage)
    const asMessage2 = WebSocketMessage.fromString(asString2)
    assert.deepEqual(asMessage2, newConnectMessage)

    const disconnectMessage = new WebSocketMessage(
      client.disconnect, subscriptionId, room._id, clientId)
    const asString3 = JSON.stringify(disconnectMessage)
    const asMessage3 = WebSocketMessage.fromString(asString3)
    assert.deepEqual(asMessage3, disconnectMessage)
  })

})
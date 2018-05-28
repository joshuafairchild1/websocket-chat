'use strict'

import MessageRegistry from '../messaging/MessageRegistry'
import { connection } from 'websocket'
import RoomChannel from './RoomChannel'
import ChatMessage from '../../shared/model/ChatMessage'
import * as sinon from 'sinon'
import { assert } from 'chai'

const ROOM_ID = 'someRoomId'

import User from '../../shared/model/User'

describe('RoomChannel', function () {

  let messages: MessageRegistry,
    uut: RoomChannel

  beforeEach(() => {
    messages = new MessageRegistry()
    uut = new RoomChannel(ROOM_ID, messages)
  })

  it('user joins, sends a message and leaves', function () {
    const add = sinon.spy<MessageRegistry>(messages, 'add')
    const wsConnection: any = sinon.mock(connection)
    const newUser = uut.newUser(wsConnection)
    const message = new ChatMessage(newUser.clientId, newUser.name, 'Hello')
    uut.addMessage(message)
    uut.forEachUser(user =>
      assert.deepEqual(newUser, user))
    sinon.assert.calledOnce(add)
    assert.isTrue(add.calledWith(message))

    uut.userLeft(newUser.clientId)
    uut.forEachUser(user => {
      if (user.clientId === newUser.clientId) {
        throw Error('test failed, user was not deleted from clients Map')
      }
    })
  })

  it('gets messages', function () {
    const user1 = new User(sinon.mock(connection) as any)
    const user2 = new User(sinon.mock(connection) as any)
    const testMessages = [
      new ChatMessage(user1.clientId, user1.name, 'Message1'),
      new ChatMessage(user1.clientId, user1.name, 'Message2'),
      new ChatMessage(user2.clientId, user2.name, 'Message3')
    ]
    testMessages.forEach(uut.addMessage.bind(uut))
    const result = uut.getMessages()
    assert.deepEqual(result, testMessages)
  })

  it('updates user\'s name and any of their messages', function () {
    const user = uut.newUser(sinon.mock(connection) as any)
    const newName = 'Han Solo'
    const testMessages = [
      new ChatMessage(user.clientId, user.name, 'Message1'),
      new ChatMessage(user.clientId, user.name, 'Message2')
    ]
    const updateNameFor = sinon.spy<MessageRegistry>(messages, 'updateNameFor')
    testMessages.forEach(uut.addMessage.bind(uut))
    uut.newUsername(user.clientId, newName)
    const result = uut.getMessages()
    const expected = testMessages.map((msg: ChatMessage) =>
      ({ ...msg, senderName: newName }))
    assert.deepEqual(result, expected)
    sinon.assert.calledOnce(updateNameFor)
    assert.isTrue(updateNameFor.calledWith(user.clientId, user.name))
  })

})
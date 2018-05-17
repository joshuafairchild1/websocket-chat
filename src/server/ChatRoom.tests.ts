'use strict'

import MessageRegistry from './MessageRegistry'
import { connection } from 'websocket'
import ChatRoom from './ChatRoom'
import ChatMessage from '../shared/model/ChatMessage'
import * as sinon from 'sinon'
import * as assert from 'assert'

describe('ChatRoom', function() {

  it('user joins, sends a message and leaves', function() {
    const messages = new MessageRegistry()
    const add = sinon.spy<MessageRegistry>(messages, 'add')
    const wsConnection: any = sinon.mock(connection)
    const uut = new ChatRoom(messages)
    const newUser = uut.newUser(wsConnection)
    const message = new ChatMessage(newUser.clientId, newUser.name, 'Hello')
    uut.addMessage(message)
    uut.forEachUser(user =>
      assert.deepStrictEqual(newUser, user))
    sinon.assert.calledOnce(add)
    assert.strictEqual(add.calledWith(message), true)

    uut.userLeft(newUser.clientId)
    uut.forEachUser(user => {
      if (user.clientId === newUser.clientId) {
        throw Error('test failed, user was not delete from clients Map')
      }
    })
  })

})
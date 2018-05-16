'use strict'

import assert from 'assert'
import MessageRegistry from './MessageRegistry.ts'
import ChatMessage from '../shared/model/ChatMessage.ts'
import TimeSource from '../shared/TimeSource.ts'

describe('Message Registry', function () {

  /** @type {MessageRegistry} */
  let uut

  beforeEach(function () {
    uut = new MessageRegistry()
    TimeSource.set()
  })

  it('add messages', function () {
    const messages = [
      new ChatMessage('someSenderId', 'Joshua', 'Test1'),
      new ChatMessage('someSecondSenderId', 'Other Joshua', 'Test2'),
      new ChatMessage('someThirdSenderId', 'Third Joshua', 'Test2')
    ]
    messages.forEach(message => uut.add(message))
    assert.deepEqual(uut.getAll(), messages)
  })

  it('updates existing messages', function () {
    const senderId1 = 'someSenderId'
    const newName = 'Joshua!!!'
    const messages = [
      new ChatMessage(senderId1, 'Joshua', 'Test1'),
      new ChatMessage('someSecondSenderId', 'Other Joshua', 'Test2'),
      new ChatMessage('someThirdSenderId', 'Third Joshua', 'Test2')
    ]
    messages.forEach(message => uut.add(message))
    uut.updateNameFor(senderId1, newName)
    assert.deepEqual(uut.getAll(), [
      new ChatMessage(senderId1, newName, 'Test1'),
      messages[1],
      messages[2]
    ])
  })

})
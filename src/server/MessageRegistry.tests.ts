'use strict'

import { assert } from 'chai'
import MessageRegistry from './MessageRegistry'
import TimeSource from '../shared/TimeSource'
import ChatMessage from '../shared/model/ChatMessage'

describe('Message Registry', function () {

  let uut: MessageRegistry

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
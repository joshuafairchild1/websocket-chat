'use strict'

import MessageStore from './MessageStore'
import ChatMessage from '../../shared/model/ChatMessage'
import { assert } from 'chai'

const ROOM_ID = 'someRoomId'

describe('MessageStore', function() {

  let uut: MessageStore

  beforeEach(async function() {
    uut = await new MessageStore('ws-chat-test').initializeCollection<MessageStore>()
    await uut.clear()
  })

  it('adds and retrieves messages', function() {
    const message1 = new ChatMessage('someSenderId', 'Joshua', 'Hello worm')
    const message2 = new ChatMessage('otherSenderId', 'Josie', 'Hello other worms')
    return Promise.all([
      uut.addMessage(ROOM_ID, message1),
      uut.addMessage(ROOM_ID, message2)
    ])
      .then(() => uut.getMessages(ROOM_ID))
      .then(result => {
        result.forEach(item => delete (item as any)._id)
        assert.deepEqual(result, [
          { ...message1, roomId: ROOM_ID },
          { ...message2, roomId: ROOM_ID }
        ])
      })
  })

})
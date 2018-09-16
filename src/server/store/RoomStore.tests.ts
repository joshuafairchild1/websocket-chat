'use strict'

import { assert } from 'chai'
import RoomStore from './RoomStore'
import Room from '../../shared/model/Room'

describe('RoomStore', function() {

  let uut: RoomStore

  beforeEach(async function() {
    uut = await new RoomStore('ws-chat-test').initializeCollection<RoomStore>()
    await uut.clear()
  })

  it('creates a room', async function() {
    const roomName = 'my room'
    const room = new Room(roomName)
    const created = await uut.create(room)
    delete created._id
    delete room._id
    assert.deepEqual(created, room)
  })

})
'use strict'

import { connection } from 'websocket'
import RoomChannel from './RoomChannel'
import * as sinon from 'sinon'
import { assert } from 'chai'

const ROOM_ID = 'someRoomId'

describe('RoomChannel', function () {

  let uut: RoomChannel
  let connection: connection

  beforeEach(() => {
    uut = new RoomChannel(ROOM_ID)
    connection = sinon.mock(connection) as any as connection
  })

  it('user joins', function () {
    const user = uut.newUser(connection)
    assert.isTrue(delete user.clientId)
    assert.deepEqual(user, { name: 'Anonymous', connection })
  })

  it('user leaves', function () {
    const { clientId } = uut.newUser(connection)
    uut.userLeft(clientId)
    uut.forEachUser(user => {
      if (user.clientId === clientId) {
        throw Error('test failed, user was not deleted from clients Map')
      }
    })
  })

  it('gets user or throws', function () {
    const user = uut.newUser(connection)
    assert.deepEqual(user, uut.getUser(user.clientId))
    uut.userLeft(user.clientId)
    assert.throws(() => uut.getUser(user.clientId), 'could not locate user')
  })

  it('closes when the last user leaves', function () {
    assert.isFalse(uut.isActive)
    const user = uut.newUser(connection)
    assert.isTrue(uut.isActive)
    uut.userLeft(user.clientId)
    assert.isFalse(uut.isActive)
  })

})
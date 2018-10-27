'use strict'

import { default as reduce } from './reducer'
import { AppState } from './StateStore'
import { Actions, StoreAction } from './Action'
import RoomJoinedPayload from '../../shared/model/RoomJoinedPayload'
import ChatMessage from '../../shared/model/ChatMessage'
import { assert } from 'chai'
import Room from '../../shared/model/Room'
import ConnectPayload from '../../shared/model/ConnectPayload'

const ROOM_ID = 'roomId'
const CLIENT_ID  ='clientId'

describe('reducer', function() {

  let testRoom: Room
  let testMessage: ChatMessage

  beforeEach(function () {
    testRoom = new Room('my room').withId(ROOM_ID)
    testMessage = new ChatMessage(CLIENT_ID, 'Person', 'hello world!')
  })

  it('reduces undefined to new state instance', function () {
    const state = reduce(undefined, <StoreAction>{})
    assert.deepEqual(state, new AppState())
  })

  it('ROOM_JOINED', function () {
    const initialState = new AppState()
    initialState.rooms = [ testRoom ]

    const messages = [ testMessage ]
    const payload = new RoomJoinedPayload(ROOM_ID, CLIENT_ID, messages)

    const action = { type: Actions.ROOM_JOINED, payload }
    const expected = new AppState([ testRoom ])
    expected.selectedRoom = <Room>{ ...testRoom, messages }
    expected.clientId = CLIENT_ID
    assert.deepEqual(reduce(initialState, action), expected)
  })

  it('LEAVE_ROOM', function () {
    const action = { type: Actions.LEAVE_ROOM }
    const initialState = new AppState([], 'Joshua', testRoom)
    const expected = new AppState()
    expected.selectedRoom = null
    expected.userName = 'Anonymous'
    assert.deepEqual(reduce(initialState, action), expected)
  })

  it('NEW_MESSAGE', function () {
    const action = { type: Actions.NEW_MESSAGE, payload: testMessage }
    const initialState = new AppState()
    initialState.selectedRoom = testRoom
    const expected = new AppState()
    expected.selectedRoom = <Room>{ ...testRoom, messages: [ testMessage ] }
    assert.deepEqual(reduce(initialState, action), expected)
  })

  it('NEW_ROOM', function () {
    const action = { type: Actions.NEW_ROOM, payload: testRoom }
    const expected = new AppState([ testRoom ])
    assert.deepEqual(reduce(undefined, action), expected)
  })

  it('UPDATE_MESSAGES', function () {
    const newMessages = [
      new ChatMessage(CLIENT_ID, 'Joshua', 'hello other world')
    ]
    const action = { type: Actions.UPDATE_MESSAGES, payload: newMessages }
    const room = <Room>{ ...testRoom, messages: [ testMessage ] }
    const updatedRoom = <Room>{ ...testRoom, messages: newMessages }
    const initialState = new AppState([ room ])
    initialState.selectedRoom = room
    const expected = new AppState([ updatedRoom ])
    expected.selectedRoom = updatedRoom
    assert.deepEqual(reduce(initialState, action), expected)
  })

  it('INITIAL_CONNECTION', function () {
    const payload = new ConnectPayload([ testRoom ], CLIENT_ID)
    const action = { type: Actions.INITIAL_CONNECTION, payload }
    const expected = new AppState([ testRoom ])
    expected.subscriptionId = CLIENT_ID
    assert.deepEqual(reduce(undefined, action), expected)
  })

  it('SET_USERNAME', function () {
    const name = 'Skippy'
    const action = { type: Actions.SET_USERNAME, payload: name }
    const expected = new AppState()
    expected.userName = name
    assert.deepEqual(reduce(undefined, action), expected)
  })

})
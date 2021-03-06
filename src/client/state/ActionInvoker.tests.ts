'use strict'

import { assert } from 'chai'
import ActionInvoker from './ActionInvoker'
import { Actions, StoreAction } from './Action'
import WebSocketMessage from '../../shared/model/WebSocketMessage'
import MessageType from '../../shared/MessageType'

describe('ActionInvoker', function() {

  const testMessage =
    new WebSocketMessage(MessageType.server.updateUsername, 'success')

  it('calls an action creator depending on the passed message', function() {
    const type = Actions.SET_USERNAME
    const actions = {
      setUsername: (payload: any): StoreAction => ({ type, payload })
    }
    const uut = new ActionInvoker(actions)

    const storeAction = uut.invokeFor(testMessage)
    assert.deepEqual(storeAction, { type, payload: 'success' })
  })

  it('throws if there is no action creator configured for a message type', function() {
    const uut = new ActionInvoker({})

    assert.throws(
      () => uut.invokeFor(testMessage),
      'no action creator configured for message type'
    )
  })

})
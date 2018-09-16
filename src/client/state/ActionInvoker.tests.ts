'use strict'

import { assert } from 'chai'
import ActionInvoker from './ActionInvoker'
import { Actions, StoreAction } from './Action'
import WebSocketMessage from '../../shared/model/WebSocketMessage'
import MessageType from '../../shared/MessageType'

describe('ActionInvoker', function() {

  it('calls an action creator depending on the passed message', function() {
    const type = Actions.SET_USERNAME
    const actions = {
      setUsername: (payload: any): StoreAction => ({ type, payload })
    }
    const message =
      new WebSocketMessage(MessageType.server.updateUsername, 'success')
    const uut = new ActionInvoker(actions)

    const storeAction = uut.invokeFor(message)
    assert.deepEqual(storeAction, { type, payload: 'success' })
  })

})
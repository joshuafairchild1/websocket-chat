'use strict'

import { ActionCreator, ActionCreators } from './StateStore'
import WebSocketMessage from '../../shared/model/WebSocketMessage'
import MessageType from '../../shared/MessageType'
import { StoreAction } from './Action'
import ConfigurationBuilder from '../ConfigurationBuilder'

export default class ActionInvoker {

  constructor(private actions: ActionCreators) {}

  private configuration = configureWithActionCreators(this.actions)

  /**
   * Dynamically invoke an action creator from the {StateStore}
   * for the given {MessageType}
   */
  invokeFor = (message: WebSocketMessage): StoreAction => {
    const { type } = message
    const creator = this.configuration.get(MessageType.forName(type))
    if (!creator) {
      throw Error(`no action creator configured for message type ${type}`)
    }
    return creator(message.payload)
  }
}

function configureWithActionCreators(actions: ActionCreators): Map<MessageType, ActionCreator> {
  const { server } = MessageType
  return new ConfigurationBuilder<MessageType, ActionCreator>()
    .add(server.newConnection, actions.initialConnection)
    .add(server.newRoom, actions.newRoom)
    .add(server.roomJoined, actions.roomJoined)
    .add(server.newMessage, actions.newMessage)
    .add(server.updateUsername, actions.setUsername)
    .add(server.updateMessages, actions.updateMessages)
    .build()
}
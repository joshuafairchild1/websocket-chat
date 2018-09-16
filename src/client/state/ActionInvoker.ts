'use strict'

import { ActionCreator, ActionCreators } from './StateStore'
import WebSocketMessage from '../../shared/model/WebSocketMessage'
import MessageType from '../../shared/MessageType'
import { StoreAction } from './Action'

type ActionCreatorConfiguration = Map<MessageType, ActionCreator>

export default class ActionInvoker {

  constructor(private actions: ActionCreators) {}

  private creators = configureActionCreators(this.actions)

  /**
   * Dynamically invoke an action creator from the {StateStore}
   * for the given {MessageType}
   */
  invokeFor = (message: WebSocketMessage): StoreAction => {
    const { type } = message
    const creator = this.creators.get(MessageType.forName(type))
    if (!creator) {
      throw Error(`no action creator configured for message type ${type}`)
    }
    return creator(message.payload)
  }
}

function configureActionCreators(actions: ActionCreators): ActionCreatorConfiguration {
  const { server } = MessageType
  return new ConfigurationBuilder()
    .add(server.newConnection, actions.initialConnection)
    .add(server.newRoom, actions.newRoom)
    .add(server.roomJoined, actions.roomJoined)
    .add(server.newMessage, actions.newMessage)
    .add(server.updateUsername, actions.setUsername)
    .add(server.updateMessages, actions.updateMessages)
    .build()
}

class ConfigurationBuilder  {
  private config = new Map()

  add(type: MessageType, actionCreator: ActionCreator): ConfigurationBuilder {
    this.config.set(type, actionCreator)
    return this
  }

  build(): ActionCreatorConfiguration {
    return this.config
  }
}
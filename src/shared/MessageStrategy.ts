'use strict'

import { logger } from './utils'
import MessageType from './MessageType'

const log = logger('MessageStrategy')
const { server } = MessageType

const STRATEGIES = Symbol('message-strategies')

export class MessageStrategy {

  constructor(messageType: MessageType, handler: Function) {
    MessageStrategy[STRATEGIES].set(messageType, handler)
  }

  static callFor(messageType: MessageType, ...args: any[]) {
    const strategy = MessageStrategy[STRATEGIES].get(messageType)
    if (!strategy || !(strategy instanceof Function)) {
      throw Error(`could not find strategy for message "${messageType.name()}"`)
    }
    try {
      strategy(...args)
    } catch (ex) {
      log('exception while invoking strategy for message', messageType.name(), ex)
    }
  }

  static [STRATEGIES] = new Map()
}

export class NewConnectionStrategy extends MessageStrategy {
  constructor(handler: Function, receiver: any | null = null) {
    super(server.newConnection, handler.bind(receiver))
  }
}

export class NewMessageStrategy extends MessageStrategy {
  constructor(handler: Function, receiver: any | null = null) {
    super(server.newMessage, handler.bind(receiver))
  }
}

export class UpdateUsernameStrategy extends MessageStrategy {
  constructor(handler: Function, receiver: any | null = null) {
    super(server.updateUsername, handler.bind(receiver))
  }
}

export class UpdateMessagesStrategy extends MessageStrategy {
  constructor(handler: Function, receiver: any | null = null) {
    super(server.updateMessages, handler.bind(receiver))
  }
}

export class NewRoomStrategy extends MessageStrategy {
  constructor(handler: Function, receiver: any | null = null) {
    super(server.newRoom, handler.bind(receiver))
  }
}

export class RoomJoinedStrategy extends MessageStrategy {
  constructor(handler: Function, receiver: any | null = null) {
    super(server.roomJoined, handler.bind(receiver))
  }
}
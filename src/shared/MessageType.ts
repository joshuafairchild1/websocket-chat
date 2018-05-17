'use strict'

const NAME = Symbol('name')

const KNOWN_MESSAGE_TYPES: Map<string, MessageType> = new Map()

export default class MessageType {

  private readonly [NAME]: string

  constructor(type: string) {
    this[NAME] = type
    KNOWN_MESSAGE_TYPES.set(type, this)
  }

  name(): string {
    return this[NAME]
  }

  hasNoPayload(): boolean {
    return this === MessageType.client.connect
      || this === MessageType.client.disconnect
  }

  static forName(name: string): MessageType {
    const type = KNOWN_MESSAGE_TYPES.get(name)
    if (!type) {
      throw Error('no message type with name: ' + name)
    }
    return type
  }

  static validate(type: MessageType | string) {
    const name = (type instanceof MessageType) ? type.name() : type
    if (MessageType.forName(name)) {
      return
    }
    throw Error('invalid message type: ' + name)
  }

  static server = {
    newConnection: new MessageType('newConnection'),
    newMessage: new MessageType('newMessage'),
    updateUsername: new MessageType('updateUsername'),
    updateMessages: new MessageType('updateMessages')
  }

  static client = {
    connect: new MessageType('connect'),
    disconnect: new MessageType('disconnect'),
    sendChat: new MessageType('sendChat'),
    setUsername: new MessageType('setUsername')
  }
}

Object.freeze(MessageType)
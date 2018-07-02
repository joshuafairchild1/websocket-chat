'use strict'

import ChatMessage from './ChatMessage'

const REQUIRED_FIELDS = [ '_id', 'name' ]

export default class Room {
  _id: string | null = null

  constructor(public name: string, public messages: ChatMessage[] = []) {
    if (!name) {
      throw Error('name is required to create a room')
    }
  }

  get id() {
    return this._id
  }

  withId(id: string): Room {
    this._id = id
    return this instanceof Room ? this : Room.instance(this)
  }

  static instance(roomLike: any): Room {
    REQUIRED_FIELDS.forEach(field => {
      if (!roomLike[field]) {
        throw Error('cannot construct room without field ' + field)
      }
    })
    const { _id, name, messages = [] } = roomLike as Room
    return new Room(name, messages).withId(_id)
  }

}
'use strict'

import ChatMessage from './ChatMessage'

export default class Room {
  _id: string | null = null

  constructor(public name: string, public messages: ChatMessage[] = []) {
    if (!name) {
      throw Error('name is required to create a room')
    }
  }

  withId(id: string): Room {
    this._id = id
    return this
  }

}
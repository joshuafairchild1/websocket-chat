'use strict'

import ChatMessage from './ChatMessage'
import { randomId } from '../utils'

export default class Room {
  id = randomId()

  constructor(public name: string, public messages: ChatMessage[] = []) {
    if (!name) {
      throw Error('name is required to create a room')
    }
  }

  // for reconstructing an existing room when an instance is necessary
  withId(id: string): Room {
    this.id = id
    return this
  }
}
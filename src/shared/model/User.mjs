'use strict'

import { ensure, randomId } from '../utils'

export default class User {
  constructor(connection, name = 'Anonymous') {
    ensure(name, String, 'username')
    this.clientId = randomId()
    this.name = name
    this.connection = connection
  }
}
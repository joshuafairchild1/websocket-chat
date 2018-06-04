'use strict'

import { randomId } from '../utils'
import { connection } from 'websocket'

export default class User {
  public clientId: string = randomId()
  public name: string = 'Anonymous'

  constructor(public connection: connection) {}
}
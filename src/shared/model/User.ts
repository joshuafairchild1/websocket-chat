'use strict'

import { randomId } from '../utils'
import { connection } from 'websocket'

export default class User {
  public clientId: string = randomId()

  constructor(
    public connection: connection,
    public name: string = 'Anonymous'
  ) {}
}
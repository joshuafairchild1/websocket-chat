'use strict'

import { randomId } from '../shared/utils'
import { connection } from 'websocket'

export class Subscription {
  public id = randomId()
  constructor(public connection: connection) {}
}
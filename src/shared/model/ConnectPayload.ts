'use strict'

import Room from './Room'

export default class ConnectPayload {
  constructor(public rooms: Room[], public subscriptionId: string) {}
}
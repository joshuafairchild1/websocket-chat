'use strict'

import WebSocketClient from './WebSocketClient'
import UiManager from './UiManager'

export default class Application {

  /**
   * @param socketPort {number}
   */
  constructor(socketPort) {
    const client = new WebSocketClient(socketPort)
    new UiManager(client)
  }

}
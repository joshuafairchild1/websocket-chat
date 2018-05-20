import * as ReactDOM from 'react-dom'
import * as React from 'react'
import App from './components/App'
import WebSocketClient from './WebSocketClient'
import { APP_PORT } from '../shared/utils'
import ClientMessenger from './ClientMessenger'

const socket = new WebSocket(`ws://localhost:${APP_PORT}`)
const client = new WebSocketClient(socket)
const messenger = new ClientMessenger(client)

ReactDOM.render(
  <App webSocketClient={client} clientMessenger={messenger} />,
  document.getElementById('root')
)
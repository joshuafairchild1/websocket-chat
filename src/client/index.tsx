import * as ReactDOM from 'react-dom'
import * as React from 'react'
import App from './components/App'
import WebSocketClient from './WebSocketClient'
import { APP_PORT } from '../shared/utils'

const socket = new WebSocket(`ws://localhost:${APP_PORT}`)
const client = new WebSocketClient(socket)

ReactDOM.render(
  <App webSocketClient={client}/>,
  document.getElementById('root')
)
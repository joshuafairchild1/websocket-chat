import * as ReactDOM from 'react-dom'
import * as React from 'react'
import App from './components/App'
import WebSocketClient from './WebSocketClient'
import { APP_PORT } from '../shared/utils'

const client = new WebSocketClient(APP_PORT)

ReactDOM.render(
  <App webSocketClient={client}/>,
  document.getElementById('root')
)
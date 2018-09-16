import './App.scss'
import * as React from 'react'
import WebSocketClient from '../WebSocketClient'
import AppController from './AppController'
import ClientMessenger from '../ClientMessenger'
import connectWithStore from '../state/connectWithStore'
import { ActionCreators, AppState } from '../state/StateStore'

type OwnProps = {
  readonly webSocketClient: WebSocketClient
  readonly clientMessenger: ClientMessenger
}
export type AppProps = OwnProps & Readonly<AppState> & { actions: ActionCreators }

const App: React.SFC<AppProps> = props =>
  <div className='app-container'>
    <AppController {...props} />
  </div>

export default connectWithStore<OwnProps>(App)
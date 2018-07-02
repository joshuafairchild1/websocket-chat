import './App.scss'
import * as React from 'react'
import WebSocketClient from '../WebSocketClient'
import Room from '../../shared/model/Room'
import AppController from './AppController'
import ClientMessenger from '../ClientMessenger'
import StateManager from '../StateManager'

export type AppProps = {
  readonly webSocketClient: WebSocketClient
  readonly clientMessenger: ClientMessenger
}

export class AppState {
  constructor(
    public rooms: Room[] = [],
    public userName: string = 'Anonymous',
    public selectedRoom: Room | null = null,
    public subscriptionId: string | null = null,
    public clientId: string | null = null
  ) { }
}

export default class App extends React.Component<AppProps, AppState> {
  private stateManager: StateManager

  constructor(props: AppProps) {
    super(props)
    this.state = new AppState()
    this.stateManager = new StateManager(this)
  }

  render() {
    return (
      <div className='app-container'>
        <AppController
          {...this.props}
          {...this.state}
          setState={this.stateManager.handleState}/>
      </div>
    )
  }

}
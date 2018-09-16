'use strict'

import Room from '../../shared/model/Room'
import Dispatcher from './Dispatcher'
import { Actions, StoreAction } from './Action'
import ConnectPayload from '../../shared/model/ConnectPayload'
import ChatMessage from '../../shared/model/ChatMessage'
import { scrollMessageList } from '../../shared/utils'
import RoomJoinedPayload from '../../shared/model/RoomJoinedPayload'
import { ServerMessagePayload } from '../../shared/Types'
import reduce from './reducer'

export type ActionCreator = (payload?: ServerMessagePayload) => StoreAction

export type ActionCreators = { [key: string]: ActionCreator } & Partial<StateStore>

type Unsubscribe = VoidFunction

export class AppState {
  constructor(
    public rooms: Room[] = [],
    public userName: string = 'Anonymous',
    public selectedRoom: Room | null = null,
    public subscriptionId: string | null = null,
    public clientId: string | null = null
  ) {}
}

export default class StateStore {

  private constructor() {}
  private state: AppState = new AppState()
  private subscribers: VoidFunction[] = []
  actions: ActionCreators = extractStoreActions(this)

  /**
   * @param {VoidFunction} listener
   *  function for the StateStore to call on each state update
   * @return {Unsubscribe}
   *  function to call when the subscriber no longer
   *  wishes to be notified of state updates
   */
  subscribe(listener: VoidFunction): Unsubscribe {
    this.subscribers.push(listener)
    return () => this.subscribers =
      this.subscribers.filter(it => it !== listener)
  }

  /**
   * @param {StoreAction} action
   *  run the {StoreAction} and current state through the reducer, updating
   *  the application state and then notifying all subscribers
   */
  dispatch(action: StoreAction): void {
    this.state = reduce(this.state, action)
    this.subscribers.forEach(sub => sub())
    action.callback && action.callback()
  }

  getState(): Readonly<AppState> {
    return this.state
  }

  @Dispatcher
  newRoom(room: Room): StoreAction {
    return { payload: room, type: Actions.NEW_ROOM }
  }

  @Dispatcher
  initialConnection(payload: ConnectPayload): StoreAction {
    return { payload, type: Actions.INITIAL_CONNECTION }
  }

  @Dispatcher
  newMessage(message: ChatMessage): StoreAction {
    return {
      payload: message,
      type: Actions.NEW_MESSAGE,
      callback: scrollMessageList
    }
  }

  @Dispatcher
  roomJoined(payload: RoomJoinedPayload): StoreAction {
    return {
      payload,
      type: Actions.ROOM_JOINED,
      callback: scrollMessageList
    }
  }

  @Dispatcher
  roomLeft(): StoreAction {
    return { type: Actions.LEAVE_ROOM, payload: '' }
  }

  @Dispatcher
  updateMessages(messages: ChatMessage[]): StoreAction {
   return {
     payload: messages,
     type: Actions.UPDATE_MESSAGES,
     callback: scrollMessageList
   }
  }

  @Dispatcher
  setUsername(name: string): StoreAction {
    return { payload: name, type: Actions.SET_USERNAME }
  }

  static singleton(): StateStore {
    const { __instance } = StateStore
    if (__instance !== null) {
      return __instance
    }
    return StateStore.__instance = new StateStore()
  }

  static __instance: StateStore | null = null

}

const NON_ACTION_CREATORS = new Set([
  'constructor', 'subscribe', 'dispatch', 'getState'
])

/**
 * A helper function for packaging all of the action creators on the StateStore,
 * to make them available within the component tree
 */
function extractStoreActions(store: StateStore): ActionCreators {
  const __proto__ = Object.getPrototypeOf(store)
  const actions = Object.getOwnPropertyNames(__proto__)
    .reduce((actions, fieldName) => {
      if (NON_ACTION_CREATORS.has(fieldName)) {
        return actions
      }
      const field = (<any>store)[fieldName]
      if (field instanceof Function) {
        actions[fieldName] = field
      }
      return actions
    }, <ActionCreators>{})
  Object.freeze(actions)
  return actions
}
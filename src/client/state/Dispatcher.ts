'use strict'

import { ActionCreator, default as StateStore } from './StateStore'

export default function Dispatcher(
  target: StateStore, propertyKey: string,
  descriptor: TypedPropertyDescriptor<ActionCreator>
) {
  const actionCreator: ActionCreator = descriptor.value
  descriptor.value = function(...args: any[]) {
    const currentStore = StateStore.singleton()
    const action = actionCreator.apply(currentStore, args)
    currentStore.dispatch(action)
    return action
  }
  return descriptor
}
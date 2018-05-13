'use strict'

export const APP_PORT = 4200

// https://gist.github.com/gordonbrander/2230317
export function randomId() {
  return '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * @param consumer {*}
 * @param functionName {string}
 * @param receiver {*}
 * @return {Function}
 */
export function makeHandlerHelper(consumer, functionName, receiver = this) {
  return (eventName, handler) => {
    consumer[functionName](eventName, handler.bind(receiver))
  }
}

/**
 * @param selector {string}
 * @return {Element}
 */
export function findElement(selector) {
  if (!selector) {
    throw Error('selector required to find document element')
  }
  const el = document.querySelectorAll(selector)[0]
  if (!el) {
    throw Error('could not find DOM element with selector ' + selector)
  }
  return el
}

/**
 * @param data {*}
 * @return {*}
 */
export function toJson(data) {
  try {
    return JSON.parse(data)
  } catch (ex) {
    throw Error('could not parse data: ' + data)
  }
}

'use strict'

export const APP_PORT = 4200

const UNDEFINED = (() => {})()

// https://gist.github.com/gordonbrander/2230317
export function randomId() {
  return '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * @param consumer {*}
 * @param methodName {string}
 * @param receiver {*}
 * @return {Function}
 */
export function makeHandlerHelper(consumer: any, methodName: string, receiver = this) {
  if (!consumer || !consumer[methodName]) {
    throw Error(`method ${methodName} not present on ${consumer}`)
  }
  return (eventName: string, handler: Function) => {
    consumer[methodName](eventName, handler.bind(receiver))
  }
}

/**
 * @param selector {string}
 * @return {Element}
 */
export function findElement(selector: string) {
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
export function toJson(data: any) {
  try {
    return JSON.parse(data)
  } catch (ex) {
    throw Error('could not parse data: ' + data)
  }
}

export const scrollToBottom = (el: Element) => {
  el.scrollTop = el.scrollHeight
}

export const listenForClick: (el: Element) => Promise<Event> = (element: Element) =>
  new Promise((resolve, reject) => {
    if (!element || !element.addEventListener) {
      reject(Error('not an HTML element: ' + element))
    }
    element.addEventListener('click', resolve.bind(this))
  })

export const logger = (label: string) => {
  if (!label) {
    throw Error('label required')
  }
  return (...statements: any[]) => console.log(`[${label}]`, ...statements)
}

export function ensure(value: any, type: any, label: string) {
  if (!label) {
    throw Error('invalid "ensure" label: ' + label)
  }
  if (((value !== UNDEFINED) && (value !== null) && value.constructor === type)
    || value instanceof type) {
    return
  }
  type = type.name || type
  try {
    value = JSON.stringify(value)
  } catch (error) {
    // not serializable
  }
  throw new Error(`expected "${label}" value "${value}" to be of type "${type}"`)
}
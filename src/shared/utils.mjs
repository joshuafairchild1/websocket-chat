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
export function makeHandlerHelper(consumer, methodName, receiver = this) {
  ensure(methodName, String, 'method name')
  if (!consumer || !consumer[methodName]) {
    throw Error(`method ${methodName} not present on ${consumer}`)
  }
  return (eventName, handler) => {
    ensure(eventName, String, 'event name')
    ensure(handler, Function, 'handler function')
    consumer[methodName](eventName, handler.bind(receiver))
  }
}

/**
 * @param selector {string}
 * @return {Element}
 */
export function findElement(selector) {
  ensure(selector, String, 'document element selector')
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

/**
 * @param element {Element}
 * @return {Promise}
 */
export const listenForClick = element => new Promise((resolve, reject) => {
  if (!element || !element.addEventListener) {
    reject(Error('not an HTML element: ' + element))
  }
  element.addEventListener('click', resolve.bind(this))
})

export const logger = (label) => {
  ensure(label, String, 'logger label')
  if (!label) {
    throw Error('label required')
  }
  return (...statements) => console.log(`[${label}]`, ...statements)
}

/**
 * @param value {*}
 * @param type {*}
 * @param label {string}
 */
export function ensure(value, type, label) {
  if (!label || typeof label !== 'string') {
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
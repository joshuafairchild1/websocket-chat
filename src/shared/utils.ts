'use strict'

import * as Logger from 'js-logger'

export const APP_PORT = 4200

// https://gist.github.com/gordonbrander/2230317
export function randomId() {
  return '_' + Math.random().toString(36).substr(2, 9)
}

export function makeHandlerHelper(
  receiver: any, methodName: string, handlerContext: any | null = null
) {
  if (!receiver || !receiver[methodName]) {
    throw Error(`method ${methodName} not present on ${JSON.stringify(receiver)}`)
  }
  return (eventName: string, handler: Function) => {
    receiver[methodName](eventName, handler.bind(handlerContext))
  }
}

export function findElement(selector: string): Element {
  if (!selector) {
    throw Error('selector required to find document element')
  }
  const el = document.querySelectorAll(selector)[0]
  if (!el) {
    throw Error('could not find DOM element with selector ' + selector)
  }
  return el
}

export function safeDeserialize <T> (data: string): T {
  try {
    return JSON.parse(data)
  } catch (ex) {
    throw Error('could not parse data: ' + data)
  }
}


Logger.useDefaults()

export const logger = (label: string) => {
  if (!label) {
    throw Error('label required for logger')
  }
  return Logger.get(label)
}

const scrollToBottom = (el: Element) => el.scrollTop = el.scrollHeight

export const scrollMessageList = () => scrollToBottom(findElement('.message-list'))

export const noOp = () => {}

export function closeModal() {
  const modal = $('.modal') as any
  modal && modal.modal()
}
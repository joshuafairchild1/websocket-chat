'use strict'

export const APP_PORT = 4200

// https://gist.github.com/gordonbrander/2230317
export function randomId() {
  return '_' + Math.random().toString(36).substr(2, 9)
}

export function makeHandlerHelper(
  consumer: any, methodName: string, receiver: any | null = null
) {
  if (!consumer || !consumer[methodName]) {
    throw Error(`method ${methodName} not present on ${consumer}`)
  }
  return (eventName: string, handler: Function) => {
    consumer[methodName](eventName, handler.bind(receiver))
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

export function toJson(data: any): any {
  try {
    return JSON.parse(data)
  } catch (ex) {
    throw Error('could not parse data: ' + data)
  }
}

export const scrollToBottom = (el: Element) => {
  el.scrollTop = el.scrollHeight
}

export const logger = (label: string) => {
  if (!label) {
    throw Error('label required')
  }
  return (...statements: any[]) => console.log(`[ ${label} ]`, ...statements)
}

export const scrollMessageList = () => scrollToBottom(findElement('.message-list'))
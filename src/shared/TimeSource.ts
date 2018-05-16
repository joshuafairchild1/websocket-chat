'use strict'

let currentTime: number | null = null

function date(): Date {
  return new Date(now())
}

function now() {
  return currentTime === null ? Date.now() : currentTime
}

function set() {
  return currentTime = Date.now()
}

export default { date, now, set }
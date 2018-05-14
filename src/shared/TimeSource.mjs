'use strict'

let currentTime = null

function date() {
  return new Date(now())
}

function now() {
  return currentTime === null ? Date.now() : currentTime
}

function set() {
  return currentTime = Date.now()
}

export default { date, now, set }
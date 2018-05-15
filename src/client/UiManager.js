'use strict'

import { ensure, findElement, listenForClick, logger, makeHandlerHelper }
  from '../shared/utils'
import moment from 'moment'
import WebSocketClient from './WebSocketClient'
import ChatMessage from '../shared/model/ChatMessage'
import MessageType from '../shared/MessageType'
import {
  NewConnectionStrategy, NewMessageStrategy, UpdateMessagesStrategy,
  UpdateUsernameStrategy
} from '../shared/MessageStrategy'

const { client } = MessageType

/**
 * @param {ChatMessage}
 * @private
 */
function renderMessage({ senderId, senderName, timestamp, content }) {
  ensure(senderId, String, 'sender ID')
  ensure(senderName, String, 'sender name')
  ensure(timestamp, String, 'message timestamp')
  ensure(content, String, 'message content')
  const container = findElement('#message-list')
  container.insertAdjacentHTML('beforeend',
    `<p class="chat-message">${senderName || senderId} `
    + `(${moment(timestamp).fromNow()}): ${content}</p>`)
  container.scrollTop = container.scrollHeight
}

/**
 * @param messages {ChatMessage[]}
 */
function updateMessages(messages) {
  ensure(messages, Array, 'chat messages')
  document.querySelectorAll('.chat-message')
    .forEach(el => el.parentElement.removeChild(el))
  messages.forEach(renderMessage)
}

/**
 * @param name {string}
 */
function updateUsername(name) {
  ensure(name, String, 'username')
  findElement('#chat-identity').textContent = name
}

const log = logger('UiManager')

export default class UiManager {

  /**
   * @param client {WebSocketClient}
   */
  constructor(client) {
    ensure(client, WebSocketClient, 'web socket client')
    this._client = client
    this._setUpHandlers()
  }

  _setUpHandlers() {
    const handleEvent = el => makeHandlerHelper(
      findElement(el), 'addEventListener', this)
    handleEvent('#chat-form')('submit', this._handleFormSubmit)
    handleEvent('#change-username-button')('click', this._changeUsername)
    new NewConnectionStrategy(this._userConnected, this)
    new NewMessageStrategy(renderMessage)
    new UpdateUsernameStrategy(updateUsername)
    new UpdateMessagesStrategy(updateMessages)
  }

  /**
   * @param event {Event}
   * @private
   */
  _handleFormSubmit(event) {
    event.preventDefault()
    const [ input ] = event.target
    const { value } = input
    if (!value) {
      log('not sending an empty message')
      return
    }
    const name = findElement('#chat-identity').textContent
    const message = new ChatMessage(this._client.id, name, value)
    this._client.sendMessage(client.sendChat, message)
    input.value = ''
  }

  _changeUsername() {
    findElement('#username-input').type = 'text'
    const chatInput = findElement('#chat-input')
    const usernameInput = findElement('#username-input')
    const identity = findElement('#chat-identity')
    const saveButton = findElement('#change-username-button')
    const cancelButton = findElement('#cancel-change-username-button')
    const saveButtonClicked = listenForClick(saveButton)
    const cancelButtonClicked = listenForClick(cancelButton)
    const resetUi = () => {
      usernameInput.value = ''
      usernameInput.type = 'hidden'
      saveButton.textContent = 'Change'
      cancelButton.classList.add('hidden')
      identity.classList.remove('hidden')
      chatInput.disabled = false
    }
    chatInput.disabled = true
    identity.classList.add('hidden')
    cancelButton.classList.remove('hidden')
    saveButton.textContent = 'Save'
    cancelButtonClicked
      .then(resetUi).catch(console.error)
    saveButtonClicked.then(() => {
        const { value } = usernameInput
        if (!value) {
          log('not setting name to empty string')
          return
        }
        this._client.sendMessage(client.setUsername, value)
        resetUi()
      }).catch(console.error)
  }

  /**
   * @param {ConnectPayload}
   * @private
   */
  _userConnected({ clientId, messages }) {
    ensure(clientId, String, 'clientId')
    findElement('#chat-identity').textContent = clientId
    this._client.id = clientId
    updateMessages(messages)
  }


}
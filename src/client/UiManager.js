'use strict'

import MESSAGE_TYPE from '../shared/MessageType'
import { findElement, makeHandlerHelper } from '../shared/utils'
import moment from 'moment'

/**
 * @param {ChatMessage}
 * @private
 */
function renderMessage({ senderId, senderName, timestamp, content }) {
  const container = findElement('#message-list')
  container.insertAdjacentHTML('beforeend',
    `<p class="chat-message">${senderName || senderId}`
    + `(${moment(timestamp).fromNow()}): ${content}</p>`)
  container.scrollTop = container.scrollHeight
}

/**
 * @param messages {ChatMessage[]}
 */
function updateMessages(messages) {
  document.querySelectorAll('.chat-message')
    .forEach(el => el.parentElement.removeChild(el))
  messages.forEach(renderMessage)
}

/**
 * @param name {string}
 */
function updateUsername(name) {
  findElement('#chat-identity').textContent = name
}

export default class UiManager {

  /**
   * @param client {WebSocketClient}
   */
  constructor(client) {
    this._client = client
    this._setUpHandlers()
  }

  _setUpHandlers() {
    const { server } = MESSAGE_TYPE
    const { _client } = this
    const handleMessage = makeHandlerHelper(_client, 'addMessageHandler', this)
    const handleEvent = el => makeHandlerHelper(findElement(el), 'addEventListener', this)
    handleEvent('#chat-form')('submit', this._handleFormSubmit)
    handleEvent('#change-username-button')('click', this._changeUsername)
    handleMessage(server.newConnection, this._userConnected)
    handleMessage(server.newMessage, renderMessage)
    handleMessage(server.updateUsername, updateUsername)
    handleMessage(server.updateMessages, updateMessages)
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
      console.log('not sending an empty message')
      return
    }
    const senderName = findElement('#chat-identity').textContent
    this._client.sendMessage(
      MESSAGE_TYPE.client.sendChat, { senderName, content: value })
    input.value = ''
  }

  _changeUsername() {
    findElement('#username-input').type = 'text'
    const chatInput = findElement('#chat-input')
    const usernameInput = findElement('#username-input')
    chatInput.disabled = true
    const identity = findElement('#chat-identity')
    identity.classList.add('hidden')
    const saveButton = findElement('#change-username-button')
    const cancelButton = findElement('#cancel-change-username-button')
    cancelButton.classList.remove('hidden')
    saveButton.textContent = 'Save'
    const listenForClick = el => new Promise(resolve =>
      el.addEventListener('click', resolve.bind(this)))
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
    saveButtonClicked
      .then(() => {
        const { value } = usernameInput
        if (!value) {
          console.log('not setting name to empty string')
          return
        }
        this._client.sendMessage(MESSAGE_TYPE.client.setUsername, value)
        resetUi()
      })
    cancelButtonClicked.then(resetUi)
  }

  /**
   * @param {{ clientId: string, messages: object[] }}
   * @private
   */
  _userConnected({ clientId, messages }) {
    findElement('#chat-identity').textContent = clientId
    this._client.setId(clientId)
    updateMessages(messages)
  }


}
'use strict'

const MESSAGE_TYPE = {
	server: {
		newConnection: 'newConnection',
		newMessage: 'newMessage',
    updateUsername: 'updateUsername',
    updateMessages: 'updateMessages'
	},
	client: {
		connect: 'connect',
		disconnect: 'disconnect',
		sendChat: 'sendChat',
    setUsername: 'setUsername'
	}
}

export default MESSAGE_TYPE
import * as React from 'react'
import { FormEvent } from 'react'
import { Button } from 'react-materialize'
import ControlledForm from './ControlledForm'

interface ChatFormProps {
  sendMessage: (message: string) => void
}

export default class ChatForm extends ControlledForm<ChatFormProps> {

  constructor(props: ChatFormProps) {
    super(props)
    this.state = { inputValue: '' }
  }

  protected handleSubmit(event: FormEvent<any>) {
    event.preventDefault()
    const [ { value } ] = event.currentTarget
    this.props.sendMessage(value)
    this.inputValue = ''
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className='chat-form'>
        <input
          type='text' className='chat-input'
          value={this.state.inputValue}
          onChange={this.handleChange}/>
        <Button type='submit' waves='light'>
          Send
        </Button>
      </form>
    )
  }

}
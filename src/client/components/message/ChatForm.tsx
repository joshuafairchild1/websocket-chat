import * as React from 'react'
import { FormEvent } from 'react'
import { Button } from 'react-materialize'
import ControlledForm from '../form/ControlledForm'
import './ChatForm.scss'

interface ChatFormProps {
  sendMessage: (message: string) => void
}

export default class ChatForm extends ControlledForm<ChatFormProps> {

  protected handleSubmit = (event: FormEvent<any>) => {
    event.preventDefault()
    const [ { value } ] = event.currentTarget
    const trimmed = value.trim()
    if (trimmed !== '') {
      this.props.sendMessage(trimmed)
      this.reset()
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className='chat-form'>
        <input type='text' className='chat-input'
               value={this.state.inputValue}
               onChange={this.handleChange}/>
        <Button type='submit' className='blue-btn'>
          Send
        </Button>
      </form>
    )
  }
}
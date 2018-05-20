import * as React from 'react'
import { ChangeEvent, Component, FormEvent } from 'react'
import { Button } from 'react-materialize'

interface ChatFormProps {
  sendMessage: (message: string) => void
}

interface ChatFormState {
  inputValue: string
}

export default class ChatForm extends Component<ChatFormProps, ChatFormState> {

  constructor(props: ChatFormProps) {
    super(props)
    this.state = { inputValue: '' }
  }

  private handleChange(event: ChangeEvent<any>) {
    this.inputValue = event.target.value
  }

  private handleSubmit(event: FormEvent<any>) {
    event.preventDefault()
    const [ { value } ] = event.currentTarget
    this.props.sendMessage(value)
    this.inputValue = ''
  }

  private set inputValue(value: string) {
    this.setState({ inputValue: value })
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)} className='chat-form'>
        <input
          type='text' className='chat-input'
          value={this.state.inputValue}
          onChange={this.handleChange.bind(this)}/>
        <Button
          type='submit'
          waves='light'>Send</Button>
      </form>
    )
  }

}
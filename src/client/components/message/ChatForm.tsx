import * as React from 'react'
import { FormEvent } from 'react'
import { Button } from 'react-materialize'
import './ChatForm.scss'
import { useFormState } from '../../hooks'

interface Props { sendMessage: (message: string) => void }

const ChatForm: React.SFC<Props> = props => {
  const { inputValue, handleValueChange, resetForm } = useFormState()

  function handleSubmit(event: FormEvent<any>) {
    event.preventDefault()
    const [ { value } ] = event.currentTarget
    const trimmed = value.trim()
    if (trimmed !== '') {
      props.sendMessage(trimmed)
      resetForm()
    }
  }

  return (
    <form onSubmit={handleSubmit} className='chat-form'>
      <input type='text' className='chat-input'
             value={inputValue}
             onChange={handleValueChange}/>
      <Button type='submit' className='blue-btn'>
        Send
      </Button>
    </form>
  )
}

export default ChatForm
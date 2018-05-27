'use strict'

import { FormEvent } from 'react'
import * as React from 'react'
import { Input } from 'react-materialize'
import { Button } from 'react-materialize'
import ControlledForm from './ControlledForm'

interface CreateRoomProps {
  createRoom: (name: string) => void
  cancelCreateRoom: VoidFunction
}

export default class CreateRoom extends ControlledForm<CreateRoomProps> {

  constructor(props: CreateRoomProps) {
    super(props)
    this.state = { inputValue: '' }
  }

  handleSubmit(event: FormEvent<any>) {
    event.preventDefault()
    const [ { value } ] = event.currentTarget
    if (value) {
      this.props.createRoom(value)
      this.inputValue = ''
    }
  }

  render() {
    return (
      <div className='create-room-container'>
        <div>
          <h4>Create new room</h4>
          <form onSubmit={this.handleSubmit}>
            <Input
              type='text'
              value={this.state.inputValue}  label='Room Name'
              onChange={this.handleChange} />
            <Button type='submit'>Create</Button>
            <Button onClick={this.props.cancelCreateRoom}>Cancel</Button>
          </form>
        </div>
      </div>
    )
  }

}
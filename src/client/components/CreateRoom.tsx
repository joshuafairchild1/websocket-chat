'use strict'

import { ChangeEvent, Component, FormEvent } from 'react'
import * as React from 'react'
import { Input } from 'react-materialize'
import { Button } from 'react-materialize'

interface CreateRoomProps {
  createRoom: (name: string) => void
  cancelCreateRoom: VoidFunction
}

interface CreateRoomState {
  inputValue: string
}

export default class CreateRoom extends Component<CreateRoomProps, CreateRoomState> {

  constructor(props: CreateRoomProps) {
    super(props)
    this.state = { inputValue: '' }
  }

  private set inputValue(value: string) {
    this.setState({ inputValue: value })
  }

  private handleChange(event: ChangeEvent<any>) {
    this.inputValue = event.target.value
  }

  private handleSubmit(event: FormEvent<any>) {
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
          <form onSubmit={this.handleSubmit.bind(this)}>
            <Input
              type='text'
              value={this.state.inputValue}  label='Room Name'
              onChange={this.handleChange.bind(this)} />
            <Button type='submit'>Create</Button>
            <Button onClick={this.props.cancelCreateRoom}>Cancel</Button>
          </form>
        </div>
      </div>
    )
  }

}
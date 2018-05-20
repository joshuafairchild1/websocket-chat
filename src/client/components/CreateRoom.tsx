'use strict'

import { ChangeEvent, Component, FormEvent } from 'react'
import * as React from 'react'

interface CreateRoomProps {
  createRoom: (name: string) => void
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
    this.props.createRoom(value)
    this.inputValue = ''
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <input
          type="text"
          value={this.state.inputValue}
          onChange={this.handleChange.bind(this)}/>
        <button type="submit">Create</button>
      </form>
    )
  }

}
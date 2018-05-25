import * as React from 'react'
import { FormEvent } from 'react'
import ControlledForm from './ControlledForm'

interface Props {
  changeUsername: (name: string) => void
}

export default class ChangeUsernameForm
  extends ControlledForm<Props, { inputValue: string, isEditing: boolean }>
{

  constructor(props: Props) {
    super(props)
    this.state = { inputValue: '', isEditing: false }
  }

  protected handleSubmit(event: FormEvent<any>) {
    event.preventDefault()
    const [ { value } ] = event.currentTarget
    if (value) {
      this.props.changeUsername(value)
      this.setIsEditing(false)
      this.inputValue = ''
    }
  }

  private setIsEditing(value: boolean) {
    this.setState({ isEditing: value })
  }

  render() {
    const { state } = this
    return state.isEditing
      ? <div>
          <form onSubmit={this.handleSubmit}>
            <input value={state.inputValue} onChange={this.handleChange}/>
            <button type='submit'>OK</button>
          </form>
          <button onClick={() => this.setIsEditing(false)}>Cancel</button>
        </div>
      : <button onClick={() => this.setIsEditing(true)}>Change</button>
  }

}
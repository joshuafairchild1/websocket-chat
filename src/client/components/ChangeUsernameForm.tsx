import * as React from 'react'
import { ChangeEvent, FormEvent } from 'react'

interface Props {
  changeUsername: (name: string) => void
}

interface State {
  inputValue: string
  isEditing: boolean
}

export default class ChangeUsernameForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { inputValue: '', isEditing: false }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  private handleSubmit(event: FormEvent<any>) {
    event.preventDefault()
    const [ { value } ] = event.currentTarget
    if (value) {
      this.props.changeUsername(value)
      this.setIsEditing(false)
    }
  }

  private handleChange(event: ChangeEvent<any>) {
    this.setState({ inputValue: event.target.value })
  }

  private setIsEditing(value: boolean) {
    this.setState({ isEditing: value })
  }

  render() {
    const { state } = this
    return (
      <div>
        {state.isEditing
          ? ( <div>
                <form onSubmit={this.handleSubmit}>
                  <input value={state.inputValue} onChange={this.handleChange}/>
                  <button type='submit'>OK</button>
                </form>
                <button onClick={() => this.setIsEditing(false)}>Cancel</button>
              </div>

          )
          : <button onClick={() => this.setIsEditing(true)}>Change</button> }
      </div>
    )
  }

}
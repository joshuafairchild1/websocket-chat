import { Component, ChangeEvent, FormEvent } from 'react'

class DefaultFormState {
  readonly inputValue: string
}

export default abstract class ControlledForm<Props> extends Component<Props, DefaultFormState>
{
  readonly state = new DefaultFormState()

  protected set inputValue(value: string) {
    this.setState({ inputValue: value })
  }

  protected handleChange = (event: ChangeEvent<any>) => {
    this.inputValue = event.target.value
  }
  // noinspection JSUnusedLocalSymbols
  protected handleSubmit = (event?: FormEvent<any>): void => {
    throw Error('handleSubmit must be implemented by subclass')
  }

  protected reset() {
    this.inputValue = ''
  }
}
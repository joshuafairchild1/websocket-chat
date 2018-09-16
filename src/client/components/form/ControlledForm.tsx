import { Component, ChangeEvent, FormEvent } from 'react'

interface DefaultFormState {
  inputValue: string
}

export default abstract class
  ControlledForm<Props, State extends DefaultFormState = DefaultFormState>
    extends Component<Props, State>
{
  protected set inputValue(value: string) {
    this.setState({ inputValue: value })
  }

  protected handleChange = (event: ChangeEvent<any>) => {
    this.inputValue = event.target.value
  }
  // noinspection JSUnusedLocalSymbols
  protected abstract handleSubmit = (event?: FormEvent<any>): void => {
    throw Error('handleSubmit must be implemented by subclass')
  }
}
import { Component, ChangeEvent, FormEvent } from 'react'

interface DefaultFormState {
  inputValue: string
}

export default abstract class
  ControlledForm<Props, State extends DefaultFormState = DefaultFormState>
    extends Component<Props, State>
{
  protected constructor(props: Props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  protected set inputValue(value: string) {
    this.setState({ inputValue: value })
  }

  protected handleChange(event: ChangeEvent<any>) {
    this.inputValue = event.target.value
  }

  protected handleSubmit(event: FormEvent<any>) {
    throw Error('handleSubmit must be implemented by subclass')
  }

}
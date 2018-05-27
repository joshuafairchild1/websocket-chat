import * as React from 'react'
import { KeyboardEvent } from 'react'
import ControlledForm from './ControlledForm'
import { Modal, Button, Input } from 'react-materialize'
import { noOp, preventDefault } from '../../shared/utils'

interface Props {
  changeUsername: (name: string) => void
}

const ModalAction = ({ text, action = noOp }: { text: string, action?: VoidFunction }) =>
  <Button flat onClick={action}
          modal='close' className='blue-btn-flat'>
    {text}
  </Button>

export default class ChangeUsername extends ControlledForm<Props> {

  constructor(props: Props) {
    super(props)
    this.state = { inputValue: '' }
  }

  handleSubmit() {
    const { inputValue } = this.state
    if (inputValue) {
      this.props.changeUsername(inputValue)
      this.inputValue = ''
    }
  }

  handleEnterKey(event: KeyboardEvent<any>) {
    if (event.key === 'Enter') {
      this.handleSubmit()
      closeModal()
    }
  }

  render() {
    const { state } = this
    const actions = [
      <ModalAction text='OK' action={this.handleSubmit} />,
      <ModalAction text='Cancel'/>
    ]
    return (
      <span>
      <Modal header='New Username'
             actions={actions}
             trigger={<Button className='blue-btn'>Change</Button>}>
        <form className='change-username-form'
              onSubmit={preventDefault}>
          <input value={state.inputValue}
                 onChange={this.handleChange}
                 onKeyDown={this.handleEnterKey.bind(this)}/>
        </form>
      </Modal>
      </span>
    )

  }

}

function closeModal() {
  ($('.modal') as any).modal()
}
'use strict'

import ControlledForm from './ControlledForm'
import { ReactNode, KeyboardEvent } from 'react'
import { closeModal } from '../../../shared/utils'
import { Modal } from 'react-materialize'
import * as React from 'react'
import ModalAction from './ModalAction'

interface ModalFormProps {
  trigger: ReactNode
  header: string
  submitButtonText: string
  onSubmit: (value: string) => void
  allowCancel: boolean
}

export default class ModalForm extends ControlledForm<ModalFormProps> {

  constructor(props: ModalFormProps) {
    super(props)
    this.state = { inputValue: '' }
  }

  handleSubmit() {
    const { inputValue } = this.state
    if (inputValue) {
      this.props.onSubmit(inputValue)
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
    const { props } = this
    const actions = [
      <ModalAction text={props.submitButtonText}
                   action={this.handleSubmit}/>
    ]
    if (props.allowCancel) {
      actions.push(<ModalAction text='Cancel'/>)
    }
    return (
      <Modal header={props.header}
             actions={actions}
             trigger={props.trigger}>
        <input value={this.state.inputValue}
               onChange={this.handleChange}
               onKeyDown={this.handleEnterKey.bind(this)}/>
      </Modal>
    )
  }

}
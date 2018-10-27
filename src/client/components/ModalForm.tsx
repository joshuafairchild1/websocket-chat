import { ReactNode, KeyboardEvent } from 'react'
import { closeModal } from '../../shared/utils'
import { Modal } from 'react-materialize'
import * as React from 'react'
import ModalAction from './ModalAction'
import { useFormState } from '../hooks'

interface Props {
  trigger: ReactNode
  header: string
  submitButtonText: string
  onSubmit: (value: string) => void
  allowCancel: boolean
}

const ModalForm: React.SFC<Props> = props => {
  const { inputValue, handleValueChange, resetForm } = useFormState()

  function handleSubmit() {
    if (inputValue) {
      props.onSubmit(inputValue)
      resetForm()
    }
  }

  const actions = [
    <ModalAction text={props.submitButtonText}
                 action={handleSubmit}/>
  ]
  if (props.allowCancel) {
    actions.push(<ModalAction text='Cancel'/>)
  }
  return (
    <Modal header={props.header}
           actions={actions}
           trigger={props.trigger}>
      <input value={inputValue}
             onChange={handleValueChange}
             onKeyDown={(event: KeyboardEvent<any>) => {
               if (event.key === 'Enter') {
                 handleSubmit()
                 closeModal()
               }
             }}/>
    </Modal>
  )
}

export default ModalForm
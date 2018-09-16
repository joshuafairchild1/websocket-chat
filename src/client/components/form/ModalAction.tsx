import * as React from 'react'
import { noOp } from '../../../shared/utils'
import { Button } from 'react-materialize'

type ModalActionProps = {
  text: string
  action?: VoidFunction
}

const ModalAction: React.SFC<ModalActionProps> = ({ text, action = noOp }) =>
  <Button flat onClick={action}
          modal='close' className='blue-btn-flat'>
    {text}
  </Button>

export default ModalAction
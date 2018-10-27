import * as React from 'react'

type PrevStateHandler <T> = (prevValue: T) => void
type SetStateHandler <T> = (value: T | PrevStateHandler<T>) => void

type FormStateHookResult = {
  inputValue: string
  setInputValue: SetStateHandler<string>
  handleValueChange: (event: React.ChangeEvent<any>) => void
  resetForm: VoidFunction
}

export function useFormState(initialState: string = ''): FormStateHookResult {
  const [inputValue, setInputValue] = (React as any).useState(initialState)
  return {
    inputValue, setInputValue,
    handleValueChange: (event) => setInputValue(event.target.value),
    resetForm: () => setInputValue('')
  }
}
import { cloneElement, isValidElement, type ReactElement } from 'react'

type ControlProps = {
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

type Props = {
  id: string
  label: string
  erreur?: string
  hint?: string
  children: ReactElement<ControlProps>
}

export function Field({ id, label, erreur, hint, children }: Props) {
  const describedBy = erreur ? `${id}-erreur` : hint ? `${id}-hint` : undefined
  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': Boolean(erreur) || undefined,
        'aria-describedby': describedBy,
      })
    : children

  return (
    <div className={`field${erreur ? ' field-invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {control}
      {erreur ? (
        <p id={`${id}-erreur`} className="field-error">
          {erreur}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

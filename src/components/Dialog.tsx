import { useEffect, useId, useRef, type ReactNode } from 'react'

type Props = {
  titre: string
  children: ReactNode
  onFermer: () => void
}

export function Dialog({ titre, children, onFermer }: Props) {
  const titreId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const fermerRef = useRef(onFermer)

  useEffect(() => {
    fermerRef.current = onFermer
  }, [onFermer])

  useEffect(() => {
    const precedent = document.activeElement
    panelRef.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') fermerRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (precedent instanceof HTMLElement) precedent.focus()
    }
  }, [])

  return (
    <div className="dialog-backdrop" onMouseDown={() => fermerRef.current()}>
      <div
        ref={panelRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={titreId}>{titre}</h2>
        {children}
      </div>
    </div>
  )
}

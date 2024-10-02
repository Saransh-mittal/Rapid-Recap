import { useEffect, useCallback } from 'react'

const useNavigationWarning = shouldWarn => {
  const handleBeforeUnload = useCallback(
    event => {
      if (shouldWarn) {
        event.preventDefault()
        event.returnValue = ''
      }
    },
    [shouldWarn],
  )

  useEffect(() => {
    if (shouldWarn) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldWarn, handleBeforeUnload])
}

export default useNavigationWarning

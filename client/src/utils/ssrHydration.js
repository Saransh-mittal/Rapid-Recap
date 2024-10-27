import { useEffect, useState } from 'react'
import { isClient } from './environment'

export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (isClient) {
      setIsHydrated(true)
    }
  }, [])

  return isHydrated
}

export const withHydration = Component => {
  return function HydratedComponent(props) {
    const isHydrated = useHydration()

    // On server, render without client-specific features
    if (!isClient) {
      return <Component {...props} isHydrated={false} />
    }

    // On client before hydration, render the SSR version
    if (!isHydrated) {
      return <Component {...props} isHydrated={false} />
    }

    // After hydration, render with all features
    return <Component {...props} isHydrated={true} />
  }
}

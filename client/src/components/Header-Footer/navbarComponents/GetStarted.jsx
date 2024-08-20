import React, { Suspense } from 'react'
import { Button, Spinner, useDisclosure } from '@chakra-ui/react'
import './GetStarted.css'
import useSound from '../../../customHooks/useSound'

// Lazy load the Signin component
const Signin = React.lazy(() => import('../../../screens/Signin'))

const GetStarted = ({
  display = 'flex',
  innerText,
  hamburgerOnClose,
  width,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { playClick } = useSound()

  return (
    <>
      <Button
        display={display}
        className="get-started-button"
        onClick={() => {
          playClick()
          onOpen()
        }}
        width={width || `auto`}
      >
        {innerText}
      </Button>
      <Suspense fallback={<Spinner />}>
        <Signin
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          hamburgerOnClose={hamburgerOnClose}
        />
      </Suspense>
    </>
  )
}

export default GetStarted

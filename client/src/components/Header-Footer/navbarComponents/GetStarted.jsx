import React, { Suspense } from 'react'
import { Button, Spinner, useDisclosure } from '@chakra-ui/react'
import './GetStarted.css'
import useSound from '../../../customHooks/useSound'

// Lazy load the Signin component
const Signin = React.lazy(() => import('../../../screens/Signin'))

const GetStarted = ({ display = 'flex', innerText, hamburgerOnClose }) => {
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
      >
        {innerText}
      </Button>
      <Suspense fallback={<Spinner />}>
        {isOpen && (
          <Signin
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            hamburgerOnClose={hamburgerOnClose}
          />
        )}
      </Suspense>
    </>
  )
}

export default GetStarted

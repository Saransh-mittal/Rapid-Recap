import React from 'react'
import { Button, useDisclosure } from '@chakra-ui/react'
import './GetStarted.css'
import Signin from '../../../screens/Signin'
import useSound from '../../../customHooks/useSound'

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
      <Signin
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        hamburgerOnClose={hamburgerOnClose}
      />
    </>
  )
}

export default GetStarted

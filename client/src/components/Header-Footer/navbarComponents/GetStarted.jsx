import React, { useContext } from 'react'
import { Button, useDisclosure } from '@chakra-ui/react'
import './GetStarted.css'
import Signin from '../../../screens/Signin'
import useSound from '../../../customHooks/useSound'
import { AppContext } from '../../../contextAPI/appContext'

const GetStarted = ({ display = 'flex', innerText, hamburgerOnClose }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { playClick } = useContext(AppContext)

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

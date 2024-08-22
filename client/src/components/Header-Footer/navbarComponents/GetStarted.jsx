import React, { Suspense } from 'react'
import { Button, Spinner, useDisclosure } from '@chakra-ui/react'
import './GetStarted.css'
import useSound from '../../../customHooks/useSound'
import { useDispatch } from 'react-redux'
import { setIsSigninOpen } from '../../../redux/appSlice'

const GetStarted = ({
  display = 'flex',
  innerText,
  hamburgerOnClose,
  width,
}) => {
  const { playClick } = useSound()
  const dispatch = useDispatch()
  return (
    <>
      <Button
        display={display}
        className="get-started-button"
        onClick={() => {
          playClick()
          hamburgerOnClose && hamburgerOnClose()
          dispatch(setIsSigninOpen(true))
        }}
        width={width || `auto`}
      >
        {innerText}
      </Button>
    </>
  )
}

export default GetStarted

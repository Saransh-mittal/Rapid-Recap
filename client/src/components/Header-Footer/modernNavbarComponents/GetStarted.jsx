import React, { Suspense } from 'react'
import { Button, Spinner, useDisclosure } from '@chakra-ui/react'
import './GetStarted.css'
import { useDispatch } from 'react-redux'
import { setIsSigninOpen } from '../../../redux/appSlice'
import { useFeatureDetection } from '../../../utils/featureDetection'
import useSafeSound from '../../../customHooks/useSafeSound'

const GetStarted = ({
  display = 'flex',
  innerText,
  hamburgerOnClose,
  width,
  onClick,
}) => {
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const dispatch = useDispatch()
  return (
    <>
      <Button
        display={display}
        className="get-started-button"
        onClick={() => {
          onClick && onClick()
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

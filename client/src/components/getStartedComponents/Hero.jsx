import React from 'react'
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import useSound from '../../customHooks/useSound'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionButton = motion(Button)

const Hero = () => {
  const { playClick } = useSound()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  return (
    <MotionBox
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0,0,0,0.5)"
      />
      <VStack spacing={8} textAlign="center" maxWidth="800px" px={4} zIndex={1}>
        <MotionHeading
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
        >
          Turn News Into Knowledge with Rapid Recap
        </MotionHeading>
        <MotionText
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          fontSize={{ base: 'xl', md: '2xl' }}
        >
          Stay informed through friendly competition
        </MotionText>
        <MotionButton
          colorScheme="brand"
          size="lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isAuthenticated && user) {
              navigate('/home')
              return
            }
            playClick()
            dispatch(setIsSigninOpen(true))
          }}
        >
          Get Started
        </MotionButton>
      </VStack>
    </MotionBox>
  )
}

export default Hero

import { Flex, keyframes, Box, Text, Heading } from '@chakra-ui/react'
import React from 'react'
import ProfileButton from '../profileComponents/ProfileButton'
import SecureProgressSVG from '../../assets/svg/SecureProgressSVG'

import { useSelector } from 'react-redux'

import { setExportData, setIsRegisterOpen } from '../../redux/appSlice'

const SecureYourProgress = () => {
  const { user } = useSelector(state => state.auth)

  const hoverAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
    `

  const getTimeLeftBeforeExpiration = () => {
    const expirationDate = new Date(user.expiresAt)
    const currentDate = new Date()
    const timeLeft = expirationDate - currentDate
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hoursLeft = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    )
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000)
    return { daysLeft, hoursLeft, minutesLeft, secondsLeft }
  }

  const { daysLeft, hoursLeft, minutesLeft, secondsLeft } =
    getTimeLeftBeforeExpiration()

  return (
    <Flex
      py={'8px'}
      borderRadius="10px"
      flexDirection="column"
      w={{ md: '85%', lg: '95%', base: '100%' }}
      height="fit-content"
      justifyContent={'center'}
      alignItems={'center'}
      position={'relative'}
      className="season-analytics"
    >
      <Box
        bg="gray.800"
        color="gray.100"
        borderRadius="md"
        p={6}
        boxShadow="lg"
        w="100%"
      >
        <Heading size="md" mb={4}>
          Secure Your Progress
        </Heading>
        <Text fontSize="sm" mb={6}>
          Your account expires in {daysLeft} days and {hoursLeft} hours
        </Text>
        <ProfileButton
          buttonText="Secure your process"
          isGuest={true}
          hoverAnimation={hoverAnimation}
          onClick={() => {
            dispatch(setIsRegisterOpen(true))
            dispatch(setExportData(user?._id))
          }}
          icon={
            <SecureProgressSVG width={'20px'} height={'20px'} fill={'#fff'} />
          }
        />
      </Box>
    </Flex>
  )
}

export default SecureYourProgress

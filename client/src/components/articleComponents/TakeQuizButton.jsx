import { Box, Button, Flex, Text } from '@chakra-ui/react'
import React, { useContext, useState } from 'react'
import { AppContext } from '../../contextAPI/appContext'
import Bubbles from '../miscellaneous/bubbles'

const TakeQuizButton = ({ onClick, css, isQuinBoostAvailable }) => {
  const { state } = useContext(AppContext)
  const isBoosted = state.isBoosted

  const buttonStyle = {
    border: isBoosted ? 'yellow solid 3px' : 'none',
    transition: isBoosted ? 'box-shadow 2s ease-in-out' : 'none',
    animation: isBoosted ? 'shine 1s infinite alternate' : 'none', // Use CSS animation for shining effect
    _hover: { opacity: 0.3 },
  }
  const keyframes = `
    @keyframes shine {
      0% {
        box-shadow: 0 0 10px 0 rgba(255, 255, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 10px 0 rgba(255, 255, 0, 0);
      }
      100% {
        box-shadow: 0 0 10px 0 rgba(255, 255, 0, 0.5);
      }
    }
  `
  return (
    <Box m={4} width="100%">
      <Button
        onClick={onClick}
        width="100%"
        height="auto"
        py={3}
        px={6}
        borderRadius="full"
        bgGradient="linear(to-r, #FDE2F3, #E5BEEC)"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.3s ease"
        position="relative"
        overflow="hidden"
        style={buttonStyle}
      >
        {(isBoosted || isQuinBoostAvailable) && <Bubbles />}
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="#2A2F4F"
          textAlign="center"
          width="100%"
          m={0}
          py={2}
          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        >
          Take Quiz
        </Text>
      </Button>
    </Box>
  )
}

export default TakeQuizButton

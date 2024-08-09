import React from 'react'
import { Flex, Box, Tooltip } from '@chakra-ui/react'
import { LockIcon } from '@chakra-ui/icons'

const LanguageToggle = React.memo(
  ({ isEnglish, onToggle, isDisabled, onSigninOpen }) => (
    <Tooltip
      label={
        isDisabled ? 'Please log in to change language' : 'Toggle language'
      }
      position={'relative'}
    >
      <Flex position={'relative'}>
        {isDisabled && (
          <LockIcon
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            color="white"
            boxSize={6}
            zIndex={2}
            onClick={onSigninOpen}
            cursor={'pointer'}
          />
        )}
        <Box
          as="button"
          display="flex"
          alignItems="center"
          bg="rgba(255, 255, 255, 0.1)"
          borderRadius="full"
          p="2px"
          cursor={isDisabled ? 'not-allowed' : 'pointer'}
          onClick={onToggle}
          position="relative"
          border="1px solid"
          borderColor="whiteAlpha.300"
          _hover={isDisabled ? {} : { borderColor: 'whiteAlpha.500' }}
          style={
            isDisabled
              ? { filter: 'blur(5px)', userSelect: 'none' }
              : { userSelect: 'text' }
          }
        >
          <Box
            px={2}
            py={1}
            borderRadius="full"
            bg={isEnglish ? 'white' : 'transparent'}
            color={isEnglish ? 'purple.800' : 'white'}
            fontWeight="bold"
            transition="all 0.3s"
            fontSize={['sm', 'md']}
          >
            ENG
          </Box>
          <Box
            px={2}
            py={1}
            borderRadius="full"
            bg={!isEnglish ? 'white' : 'transparent'}
            color={!isEnglish ? 'purple.800' : 'white'}
            fontWeight="bold"
            transition="all 0.3s"
            fontSize={['sm', 'md']}
          >
            HIN
          </Box>
        </Box>
      </Flex>
    </Tooltip>
  ),
)

export default LanguageToggle

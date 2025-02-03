import React, { useState } from 'react'
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react'
import i18n from 'i18next'

const NotUserLangSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  // Responsive font size and padding
  const fontSize = useBreakpointValue({
    base: '0.7rem',
    sm: '0.8rem',
    md: '1rem',
  })
  const paddingX = useBreakpointValue({ base: 1, sm: 2 })

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(newLanguage)
    setCurrentLanguage(newLanguage)
  }

  return (
    <Flex
      as="button"
      alignItems="center"
      bg="rgba(255, 255, 255, 0.1)"
      borderRadius="full"
      cursor="pointer"
      onClick={toggleLanguage}
      border="1px solid"
      borderColor="whiteAlpha.300"
      _hover={{ borderColor: 'whiteAlpha.500' }}
      mx="auto"
      h={{ base: '2rem', sm: '2.2rem', md: '2.4rem' }}
      w={{ base: '8rem', sm: '9rem', md: '9.6rem' }}
    >
      <Box
        px={paddingX}
        py={1}
        borderRadius="full"
        bg={currentLanguage === 'en' ? 'white' : 'transparent'}
        color={currentLanguage === 'en' ? 'blue.500' : 'white'}
        fontWeight="bold"
        transition="all 0.3s"
        fontSize={fontSize}
        textTransform="uppercase"
        width="50%"
        textAlign="center"
      >
        English
      </Box>
      <Box
        px={paddingX}
        py={1}
        borderRadius="full"
        bg={currentLanguage === 'hi' ? 'white' : 'transparent'}
        color={currentLanguage === 'hi' ? 'blue.500' : 'white'}
        fontWeight="bold"
        transition="all 0.3s"
        fontSize={fontSize}
        textTransform="uppercase"
        width="50%"
        textAlign="center"
      >
        हिन्दी
      </Box>
    </Flex>
  )
}

export default NotUserLangSwitcher

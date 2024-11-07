import React from 'react'
import { Button, HStack, Box, Text, Icon } from '@chakra-ui/react'
import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const MotionButton = motion(Button)

const LanguageSwitchButton = ({ COLORS }) => {
  const { i18n } = useTranslation()

  const changeLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(newLang)
    localStorage.setItem('i18nextLng', newLang)
  }

  return (
    <Box position="relative">
      <MotionButton
        onClick={changeLanguage}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        bg={COLORS.darkBg}
        color="white"
        border="1px solid"
        borderColor={COLORS.cardBorder}
        _hover={{
          bg: 'rgba(237, 100, 166, 0.1)',
          borderColor: COLORS.accent,
          boxShadow: `0 0 20px ${COLORS.accent}33`,
        }}
        px={4}
        py={2}
        height="auto"
        rounded="full"
        fontSize="md"
        position="relative"
        overflow="hidden"
      >
        <HStack spacing={2} alignItems="center">
          <Icon as={Languages} w={5} h={5} color={COLORS.accent} />
          <Text fontWeight="medium">
            {i18n.language === 'en' ? 'English' : 'हिंदी'}
          </Text>
          <Box
            as="span"
            bg="green.400"
            w={2}
            h={2}
            rounded="full"
            position="relative"
            top={0}
            right={0}
          />
        </HStack>
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="2px"
          bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
        />
      </MotionButton>
    </Box>
  )
}

export default LanguageSwitchButton

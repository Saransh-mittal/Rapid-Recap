import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@chakra-ui/react'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const handleLanguageChange = lng => {
    i18n.changeLanguage(lng)
  }

  return (
    <Flex justifyContent="center" mt={4}>
      <Button onClick={() => handleLanguageChange('en')} mr={2}>
        English
      </Button>
      <Button onClick={() => handleLanguageChange('hi')}>हिंदी</Button>
    </Flex>
  )
}

export default LanguageSwitcher

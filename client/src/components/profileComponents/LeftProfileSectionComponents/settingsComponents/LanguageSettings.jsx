// File: src/components/Settings/LanguageSettings.js
import React from 'react'
import { VStack } from '@chakra-ui/react'
import LanguageSwitcher from '../../../../LanguageSwitcher'

const LanguageSettings = () => {
  return (
    <VStack align="stretch" spacing={4}>
      <LanguageSwitcher />
    </VStack>
  )
}

export default LanguageSettings

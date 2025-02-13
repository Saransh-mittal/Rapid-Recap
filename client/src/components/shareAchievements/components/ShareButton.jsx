// src/components/shareAchievements/components/ShareButton.jsx

import React from 'react'
import { Button } from '@chakra-ui/react'
import { Share2 } from 'lucide-react'

const ShareButton = ({ onClick, isGenerating = false }) => {
  return (
    <Button
      leftIcon={<Share2 />}
      onClick={onClick}
      colorScheme="purple"
      variant="ghost"
      size="sm"
      isLoading={isGenerating}
      loadingText="Generating..."
      _hover={{ bg: 'rgba(128, 90, 213, 0.12)' }}
    >
      Share Achievements
    </Button>
  )
}

export default ShareButton

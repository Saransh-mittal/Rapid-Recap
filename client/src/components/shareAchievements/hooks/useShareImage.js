// src/components/shareAchievements/hooks/useShareImage.js

import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import html2canvas from 'html2canvas'
import { SHARE_CONFIG } from '../constants/shareConfig'

export const useShareImage = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const generateAndShareImage = async elementRef => {
    if (!elementRef.current) return

    try {
      setIsGenerating(true)

      // Ensure element is rendered
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: SHARE_CONFIG.CANVAS.BACKGROUND,
        scale: SHARE_CONFIG.CANVAS.SCALE,
        useCORS: true,
        logging: false,
        windowWidth: SHARE_CONFIG.CANVAS.WIDTH,
        windowHeight: SHARE_CONFIG.CANVAS.HEIGHT,
      })

      const image = canvas.toDataURL('image/png')

      if (navigator.share) {
        await navigator.share({
          files: [
            new File([await (await fetch(image)).blob()], 'achievements.png', {
              type: 'image/png',
            }),
          ],
        })
      } else {
        // Fallback - download image
        const link = document.createElement('a')
        link.download = 'achievements.png'
        link.href = image
        link.click()
      }

      toast({
        title: 'Success!',
        description: 'Your achievements are ready to share!',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to generate achievements image',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    generateAndShareImage,
  }
}

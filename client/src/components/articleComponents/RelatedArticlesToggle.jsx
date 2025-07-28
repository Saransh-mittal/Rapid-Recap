// Enhanced RelatedArticlesToggle.jsx with fixed animation
// Location: client/src/components/articleComponents/RelatedArticlesToggle.jsx

import React from 'react'
import { Flex, Box, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const RelatedArticlesToggle = React.memo(({ showRelated, onToggle }) => {
  const { t } = useTranslation('RelatedArticlesToggle')

  return (
    <Box
      position="relative"
      bg="rgba(255, 255, 255, 0.08)"
      borderRadius="xl"
      p="4px"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(10px)"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
      w="100%"
      maxW={{ base: '320px', md: '380px', lg: '420px' }}
      mx="auto"
    >
      {/* Animated Background Slider */}
      <MotionBox
        position="absolute"
        top="4px"
        bottom="4px"
        width="calc(50% - 2px)"
        bg="linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(99, 102, 241, 0.9))"
        borderRadius="lg"
        boxShadow="0 2px 10px rgba(59, 130, 246, 0.3)"
        initial={false}
        animate={{
          left: showRelated ? 'calc(50% + 2px)' : '4px',
        }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 30,
          mass: 0.5,
        }}
      />

      {/* Toggle Buttons Container */}
      <Flex position="relative" zIndex={2} w="100%">
        {/* Recommended Articles Button */}
        <Box
          as="button"
          onClick={() => showRelated && onToggle()}
          flex={1}
          py={{ base: 3, md: 3.5 }}
          px={{ base: 2, md: 3 }}
          textAlign="center"
          cursor="pointer"
          borderRadius="lg"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={
            !showRelated
              ? {}
              : {
                  bg: 'rgba(255, 255, 255, 0.05)',
                }
          }
          _active={{
            transform: 'scale(0.98)',
          }}
          disabled={!showRelated}
        >
          <Text
            fontSize={{ base: '0.75rem', md: '0.85rem', lg: '0.9rem' }}
            fontWeight={!showRelated ? '700' : '600'}
            color={!showRelated ? 'white' : 'rgba(255, 255, 255, 0.7)'}
            textTransform="uppercase"
            letterSpacing="wider"
            lineHeight="1.2"
            transition="all 0.3s ease"
            textShadow={!showRelated ? '0 1px 3px rgba(0, 0, 0, 0.3)' : 'none'}
          >
            {t('remmondedArticles')}
          </Text>
        </Box>

        {/* Related Articles Button */}
        <Box
          as="button"
          onClick={() => !showRelated && onToggle()}
          flex={1}
          py={{ base: 3, md: 3.5 }}
          px={{ base: 2, md: 3 }}
          textAlign="center"
          cursor="pointer"
          borderRadius="lg"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={
            showRelated
              ? {}
              : {
                  bg: 'rgba(255, 255, 255, 0.05)',
                }
          }
          _active={{
            transform: 'scale(0.98)',
          }}
          disabled={showRelated}
        >
          <Text
            fontSize={{ base: '0.75rem', md: '0.85rem', lg: '0.9rem' }}
            fontWeight={showRelated ? '700' : '600'}
            color={showRelated ? 'white' : 'rgba(255, 255, 255, 0.7)'}
            textTransform="uppercase"
            letterSpacing="wider"
            lineHeight="1.2"
            transition="all 0.3s ease"
            textShadow={showRelated ? '0 1px 3px rgba(0, 0, 0, 0.3)' : 'none'}
          >
            {t('relatedArticles')}
          </Text>
        </Box>
      </Flex>

      {/* Subtle Glow Effect */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        borderRadius="xl"
        bg="linear-gradient(135deg, rgba(159, 122, 234, 0.1), rgba(214, 158, 46, 0.1))"
        opacity={0}
        transition="opacity 0.3s ease"
        pointerEvents="none"
        _groupHover={{
          opacity: 1,
        }}
      />
    </Box>
  )
})

RelatedArticlesToggle.displayName = 'RelatedArticlesToggle'

export default RelatedArticlesToggle

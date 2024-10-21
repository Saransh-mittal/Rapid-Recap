// File: src/components/onboarding/ArticleReading.jsx

import React, { useEffect } from 'react'
import {
  Box,
  VStack,
  Text,
  Image,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import OnboardingQuizButton from './OnboardingQuizButton'
import OnboardingArticleHeader from './OnboardingArticleHeader'
import MajesticLoading from './MajesticLoading'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const ArticleReading = ({
  onNext,
  article,
  isArticleFetching,
  fetchOnBoardingArticle,
}) => {
  const { t } = useTranslation('ArticleReading')

  const padding = useBreakpointValue({ base: 4, md: 8 })
  const maxWidth = useBreakpointValue({ base: '100%', md: '800px' })
  const fontSize = useBreakpointValue({ base: 'md', md: 'lg' })

  useEffect(() => {
    if (article === null && !isArticleFetching) fetchOnBoardingArticle()
  }, [])

  if (isArticleFetching) {
    return (
      <Box
        maxH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        w="100%"
        h="100vh"
      >
        <MajesticLoading />
      </Box>
    )
  }

  return (
    <Box
      maxH="90vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      w="100%"
    >
      <Box w="95%" maxW={maxWidth} mt={{ base: '0.5rem', md: '1.5rem' }}>
        <OnboardingArticleHeader
          title={article?.title}
          author={article?.author}
          readTime={article?.avgReadTime}
        />
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          bg="rgba(26, 21, 39, 0.8)"
          p={padding}
          borderBottomRadius="xl"
          width="100%"
          overflowY="auto"
        >
          <VStack spacing={6} align="stretch">
            <Image
              src={article?.image}
              alt={article?.title}
              borderRadius="md"
              objectFit="cover"
              width="100%"
              height={{ base: '200px', md: '300px' }}
            />
            <Text fontSize={fontSize} color="white" lineHeight="1.8">
              {article?.mainText}
            </Text>
            <Flex justifyContent="center" mt={4}>
              <OnboardingQuizButton onClick={onNext} />
            </Flex>
          </VStack>
        </MotionBox>
      </Box>
    </Box>
  )
}

export default ArticleReading

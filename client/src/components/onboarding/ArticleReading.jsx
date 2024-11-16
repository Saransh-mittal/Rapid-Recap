import React, { useEffect } from 'react'
import { Box, VStack, Flex, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import OnboardingQuizButton from './OnboardingQuizButton'
import OnboardingArticleHeader from './OnboardingArticleHeader'
import MajesticLoading from './MajesticLoading'
import { useTranslation } from 'react-i18next'
import MainArticleContent from '../articleComponents/MainArticleContent'

const MotionBox = motion(Box)

const ArticleReading = ({
  onNext,
  article,
  isArticleFetching,
  fetchOnBoardingArticle,
}) => {
  const { t } = useTranslation('OnboardingProcess')
  const articleRef = React.useRef()
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
          t={t}
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
            <MainArticleContent
              imgURL={article?.image}
              mainText={article?.mainText}
              articleRef={articleRef}
              articleLoading={isArticleFetching}
              themedContent={''}
              dictionary={article?.dictionary}
              importantSentences={article?.importantSentences}
            />
            <Flex justifyContent="center" mt={4}>
              <OnboardingQuizButton onClick={onNext} t={t} />
            </Flex>
          </VStack>
        </MotionBox>
      </Box>
    </Box>
  )
}

export default ArticleReading

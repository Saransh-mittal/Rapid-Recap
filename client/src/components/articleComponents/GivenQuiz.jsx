import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import QuizReport from '../quizComponents/QuizReport'

import { useTranslation } from 'react-i18next'
import { useFeatureDetection } from '../../utils/featureDetection'
import useSafeSound from '../../customHooks/useSafeSound'

const medalIcon = '../../assets/medal.webp'

const GivenQuiz = ({ percentile, RQM_score, articleId, css }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const { t } = useTranslation('GivenQuiz')

  return (
    <Box
      bgGradient="linear(to-b, rgba(42, 47, 79, 0.7), rgba(145, 127, 179, 0.7))"
      color="white"
      borderRadius="lg"
      p={6}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      mb={5}
      css={css}
    >
      <Flex direction="column" align="center">
        <Heading as="h2" size="xl" textAlign="center" mb={3} color="#FDE2F3">
          {t('quizPerformance')}
        </Heading>
        <Heading
          as="h3"
          fontSize="xl"
          mt={2}
          mb={2}
          color="#E5BEEC"
          align={'center'}
        >
          {t('currentPercentile')} {percentile?.toFixed(2)}%
        </Heading>
        <Flex align="center" mb={4}>
          <Tooltip
            label={t('tooltipLabel')}
            aria-label="RQM Score Info"
            hasArrow
            bg="#1a1527"
            color="#e0e0e0"
            p={2}
            borderRadius="md"
          >
            <Image
              src={medalIcon}
              alt="Rating"
              boxSize="25px"
              mr={2}
              cursor="help"
            />
          </Tooltip>
          <Heading as="h3" fontSize="xl" color="#E5BEEC">
            {t('rqmScore')} {RQM_score}
          </Heading>
        </Flex>
        <Button
          onClick={() => {
            playClick()
            onOpen()
            setShowQuizSummary(true)
          }}
          bg="linear-gradient(135deg, #FDE2F3 0%, #E5BEEC 100%)"
          color="#2A2F4F"
          fontWeight="bold"
          px={6}
          py={3}
          borderRadius="full"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          transition="all 0.3s ease"
        >
          {t('viewReportButton')}
        </Button>
        {showQuizSummary && (
          <QuizReport
            isOpen={isOpen}
            onClose={() => {
              onClose()
              setShowQuizSummary(false)
            }}
            articleId={articleId}
          />
        )}
      </Flex>
    </Box>
  )
}

export default GivenQuiz

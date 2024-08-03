import React, { useContext, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { AppContext } from '../../contextAPI/appContext'
import QuizReport from './quizComponents/QuizReport'
import medalIcon from '../../assets/medal.webp'

const GivenQuiz = ({ percentile, RQM_score, articleId, css }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const { playClick } = useContext(AppContext)

  useEffect(() => {}, [percentile, RQM_score, articleId, css])

  return (
    <Box
      bgGradient="linear(to-b, #2A2F4F, #917FB3)"
      color="white"
      borderRadius="lg"
      p={6}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      mb={5}
      css={css}
    >
      <Flex direction="column" align="center">
        <Heading as="h2" size="xl" textAlign="center" mb={3} color="#FDE2F3">
          Quiz Performance
        </Heading>
        <Heading as="h3" fontSize="xl" mt={2} mb={2} color="#E5BEEC">
          Current Percentile: {percentile?.toFixed(2)}%
        </Heading>
        <Flex align="center" mb={4}>
          <Tooltip
            label="This is the Rapid Quiz Mastery (RQM) score. It is calculated based on the number of correct answers, time taken to complete the quiz and the difficulty level of the overall quiz. The higher the RQM-Score, the better the performance."
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
            RQM-Score: {RQM_score}
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
          View Report
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

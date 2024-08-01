import React, { useContext, useEffect, useState } from 'react'
import medalIcon from '../../assets/medal.webp'
import {
  Button,
  Flex,
  Heading,
  Image,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import QuizGivenSummary from './quizComponents/QuizGivenSummary'
import QuizReport from './quizComponents/QuizReport'
import useSound from '../../customHooks/useSound'
import { AppContext } from '../../contextAPI/appContext'

const GivenQuiz = ({ percentile, RQM_score, articleId, css }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const { playClick } = useContext(AppContext)
  useEffect(() => {}, [percentile, RQM_score, articleId, css])
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      bgGradient="linear-gradient(-180deg, #1A374D, #406882  58%, #6998AB 99%)"
      color="white"
      borderRadius="lg"
      p={6}
      boxShadow="5px 4px 8px rgba(0, 0, 0, 0.5)"
      marginBottom={5}
      css={css}
    >
      <Heading as="h6" size="xl" textAlign="center" mb={3} color="#B1D0E0">
        Quiz Performance
      </Heading>
      <Flex flexDirection="column" alignItems="center">
        <Heading
          textAlign={'center'}
          as="h6"
          fontSize="20px"
          mt={2}
          mb={2}
          color="#D4ECDD"
        >
          Current Percentile: {percentile?.toFixed(2)}%
        </Heading>
        <Heading
          textAlign={'center'}
          as="h6"
          fontSize="20px"
          mb={4}
          color="#D4ECDD"
        >
          <Flex gap={'10px'}>
            <Tooltip
              color={'grey.300'}
              label="This is the Rapid Quiz Mastery(RQM) score. It is calculated based on the number of correct answers, time taken to complete the quiz and the difficulty level of the overall quiz. The higher the RQM-Score, the better the performance."
              aria-label="A tooltip"
              textAlign={'justify'}
              rounded={'md'}
              p={'10px'}
              bg={'#EEF5FF'}
            >
              <Image
                src={medalIcon}
                alt="Rating"
                width={'25px'}
                height={'25px'}
                bg={'none'}
              />
            </Tooltip>
            RQM-Score: {RQM_score}
          </Flex>
        </Heading>
        <Button
          onClick={() => {
            playClick()
            onOpen()
            setShowQuizSummary(true)
          }}
          marginTop={'10px'}
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
    </Flex>
  )
}

export default GivenQuiz

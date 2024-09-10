import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from 'react'
import ModalComponent from './ModalComponent'
import { Flex, useToast, Spinner } from '@chakra-ui/react'
import axios from 'axios'

const QuizGivenSummary = React.lazy(() => import('./QuizGivenSummary'))
const SubmittedQuizInterface = React.lazy(() =>
  import('./SubmittedQuizInterface'),
)

const QuizReport = ({ isOpen, articleId, onClose }) => {
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const [load, setLoad] = useState(true)
  const [timeTaken, setTimeTaken] = useState(0)
  const [quizGivenSummary, setQuizGivenSummary] = useState([])
  const [result, setResult] = useState({})
  const toast = useToast()

  const fetchQuizSummary = useCallback(async () => {
    try {
      const response = await axios.get(`/api/quiz/summary/${articleId}`)
      setTimeTaken(response.data.timeTaken)
      setResult(response.data)
      setQuizGivenSummary(() => [...response.data.result])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error fetching quiz summary',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.error(error)
    } finally {
      setLoad(false)
    }
  }, [articleId, toast])

  useEffect(() => {
    fetchQuizSummary()
  }, [fetchQuizSummary])

  const renderModalBody = useCallback(() => {
    if (showQuizSummary) {
      return (
        <Suspense fallback={null}>
          <QuizGivenSummary
            timeTakenInitial={timeTaken}
            quizGivenSummaryInitial={quizGivenSummary}
            isOpen={isOpen}
            onClose={() => setShowQuizSummary(false)}
            articleId={articleId}
            fetchQuizSummaryFromAnotherComp={true}
          />
        </Suspense>
      )
    }

    if (load) {
      return (
        <Flex
          width={'100%'}
          height="300px"
          justifyContent="center"
          alignItems={'center'}
        >
          <Spinner />
        </Flex>
      )
    }

    return (
      <Suspense fallback={null}>
        <SubmittedQuizInterface
          submitLoad={false}
          result={result}
          onViewReport={() => setShowQuizSummary(true)}
        />
      </Suspense>
    )
  }, [
    showQuizSummary,
    load,
    timeTaken,
    quizGivenSummary,
    result,
    isOpen,
    articleId,
  ])

  return (
    <ModalComponent
      load={load}
      renderModalBody={renderModalBody}
      onClose={onClose}
      isOpen={isOpen}
    />
  )
}

export default React.memo(QuizReport)

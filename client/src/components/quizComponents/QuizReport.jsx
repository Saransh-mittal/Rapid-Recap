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
import i18n from 'i18next'

const QuizGivenSummary = React.lazy(() => import('./QuizGivenSummary'))
const SubmittedQuizInterface = React.lazy(() =>
  import('./SubmittedQuizInterface'),
)

const QuizReport = ({
  isOpen,
  articleId,
  onClose,
  isTournament = false,
  tournamentId,
  category,
}) => {
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const [load, setLoad] = useState(true)
  const [timeTaken, setTimeTaken] = useState(0)
  const [quizGivenSummary, setQuizGivenSummary] = useState([])
  const [result, setResult] = useState({})
  const toast = useToast()

  const fetchQuizSummary = useCallback(async () => {
    try {
      console.log('fetchQuizSummary')
      console.log(isTournament)
      const response = isTournament
        ? await axios.get(`/api/tournament/quiz/summary`, {
            params: {
              tournamentId,
              category,
              lang: i18n.language,
            },
          })
        : await axios.get(`/api/quiz/summary/${articleId}`)

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
            isTournament={isTournament}
            tournamentId={tournamentId}
            category={category}
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
          isTournament={isTournament}
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
      isTournament={isTournament}
      size={isTournament ? 'full' : { base: 'full', md: '2xl' }}
    />
  )
}

export default React.memo(QuizReport)

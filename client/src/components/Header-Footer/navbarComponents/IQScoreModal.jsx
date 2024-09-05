import React, { useEffect, useState, useCallback, Suspense } from 'react'
import axios from 'axios'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
  Box,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

// Lazy load components
const IQLineGraph = React.lazy(() =>
  import('../../profileComponents/IQLineGraph'),
)
const Heading = React.lazy(() => import('../../miscellaneous/HeadingComponent'))

const IQScoreModal = ({ setShowIQScoreModal, isGuest }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation('IQScoreModal') // Use the translation hook
  const { t: IQLineTranslate } = useTranslation('IQLineGraph')
  const [lineGraph, setLineGraph] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const responsiveChartWidth = useBreakpointValue({
    base: 275,
    md: 300,
    lg: 400,
    xl: 500,
  })

  useEffect(() => {
    onOpen() // Open modal when component mounts
    fetchLineGraphData() // Fetch data on component mount
  }, [])

  // Memoized function to fetch line graph data
  const fetchLineGraphData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/user/lineGraph`)
      setLineGraph(response.data.lineGraph)
    } catch (err) {
      console.error('Error fetching line graph data:', err)
      setError(t('fetchError')) // Use translation for the error message
    } finally {
      setLoading(false) // Set loading to false regardless of the result
    }
  }, [t])

  // Memoized function to handle modal close
  const handleClose = useCallback(() => {
    onClose() // Close the modal
    setShowIQScoreModal(false) // Ensure parent state is updated
  }, [onClose, setShowIQScoreModal])

  return (
    <>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose}>
          <ModalOverlay bg="rgba(15, 13, 21, 0.8)" />
          <ModalContent
            maxW={{ base: '100vw', md: '60vw' }}
            py={8}
            borderRadius="lg"
            bg="#1a1527"
            backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
            color="white"
            fontFamily="'Roboto', sans-serif"
          >
            <ModalCloseButton color={'white'} onClick={handleClose} />
            <Suspense fallback={<div>{t('loading')}</div>}>
              <Heading title={t('iqScoreHistoryTitle')} />
            </Suspense>

            <ModalBody px={0}>
              {loading ? (
                <Text>{t('loadingHistory')}</Text>
              ) : error ? (
                <Text color="red.500">{error}</Text>
              ) : (
                <Suspense fallback={<Text>{t('loadingChart')}</Text>}>
                  <IQLineGraph
                    lineGraph={lineGraph}
                    iOpenedFromNav={true}
                    graphwidth={responsiveChartWidth}
                    t={IQLineTranslate}
                  />
                </Suspense>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default IQScoreModal

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
} from '@chakra-ui/react'

// Lazy load components
const IQLineGraph = React.lazy(() =>
  import('../../profileComponents/IQLineGraph'),
)
const Heading = React.lazy(() => import('../../miscellaneous/HeadingComponent'))

const IQScoreModal = ({ setShowIQScoreModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [lineGraph, setLineGraph] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      setError('Failed to load IQ score history')
    } finally {
      setLoading(false) // Set loading to false regardless of the result
    }
  }, [])

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
            bg="#1a1527"
            backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
            maxW={{ base: '100vw', md: '60vw' }}
            py={8}
            px={{ base: 2, md: 8 }}
            borderRadius="lg"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
            color="white"
            fontFamily="'Roboto', sans-serif"
          >
            <ModalCloseButton color={'white'} onClick={handleClose} />
            <Suspense fallback={<div>Loading...</div>}>
              <Heading title="IQ Score History" />
            </Suspense>

            <ModalBody>
              {loading ? (
                <Text>Loading IQ score history...</Text>
              ) : error ? (
                <Text color="red.500">{error}</Text>
              ) : (
                <Suspense fallback={<Text>Loading chart...</Text>}>
                  <IQLineGraph lineGraph={lineGraph} iOpenedFromNav={true} />
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

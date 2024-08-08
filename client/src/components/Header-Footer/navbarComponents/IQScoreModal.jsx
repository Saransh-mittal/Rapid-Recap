import React, { useEffect, useState } from 'react'
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
  // Heading,
} from '@chakra-ui/react'
import IQLineGraph from '../../profileComponents/IQLineGraph'
import Heading from '../../miscellaneous/HeadingComponent'

const IQScoreModal = ({ setShowIQScoreModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [lineGraph, setLineGraph] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    onOpen() // Open modal when component mounts
    fetchLineGraphData() // Fetch data on component mount
  }, [])

  const fetchLineGraphData = async () => {
    try {
      const response = await axios.get(`/api/user/lineGraph`)
      setLineGraph(response.data.lineGraph)
    } catch (err) {
      console.error('Error fetching line graph data:', err)
      setError('Failed to load IQ score history')
    } finally {
      setLoading(false) // Set loading to false regardless of the result
    }
  }

  const handleClose = () => {
    onClose() // Close the modal
    setShowIQScoreModal(false) // Ensure parent state is updated
  }

  return (
    <>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose}>
          <ModalOverlay bg="rgba(15, 13, 21, 0.8)" />
          <ModalContent
            // className="iq-score-modal"
            bg="#1a1527"
            backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
            maxW={{ base: '100vw', md: '60vw' }}
            // maxH={'auto'} // h="auto"
            // w="auto"
            // h={'30vw'}
            py={8}
            px={{ base: 2, md: 8 }}
            borderRadius="lg"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
            color="white"
            fontFamily="'Roboto', sans-serif"
          >
            <ModalCloseButton
              color={'white'}
              onClick={handleClose} // Use the handleClose function
            />
            <Heading title="IQ Score History" />

            {loading ? (
              <Text>Loading IQ score history...</Text>
            ) : error ? (
              <Text color="red.500">{error}</Text>
            ) : (
              <IQLineGraph
                lineGraph={lineGraph}
                // isNavIQ={true}
              />
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default IQScoreModal

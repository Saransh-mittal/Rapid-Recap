import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Image,
  useToast,
  Flex,
  Heading,
} from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import Trophy from '/images/trophy.webp'
import axios from 'axios'
import Loading from '../miscellaneous/Loading'
import { useNavigate } from 'react-router-dom'
import CircleAndSocietyData from '../../assets/CircleAndSocietyData'
import NameLightning from '../miscellaneous/NameLightning'
import useSound from '../../customHooks/useSound'
import { AppContext } from '../../contextAPI/appContext'

const QuizTitansModal = ({ setShowQuizTitans, quizSubmitted }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [load, setLoad] = useState(true)
  const [rankers, setRankers] = useState([])
  const navigate = useNavigate()
  const toast = useToast()
  const { playClick } = useContext(AppContext)

  const fetchRankers = async () => {
    try {
      const segments = window.location.href.split('/')
      const articleId = segments[segments.length - 1]
      const response = await axios.get(
        `/api/articles/topRankers?articleId=${articleId}`,
      )
      setRankers(response.data.rankers)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error fetching rankers',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.log(error)
    } finally {
      setLoad(false)
    }
  }

  useEffect(() => {
    fetchRankers()
    onOpen()
  }, [])

  useEffect(() => {
    if (quizSubmitted) {
      setLoad(true)
      fetchRankers()
    }
  }, [quizSubmitted])

  const findSocietyAndCircle = IQ => {
    for (let i = 0; i < CircleAndSocietyData.length; i++) {
      const { IQ_Lower, IQ_Upper } = CircleAndSocietyData[i]
      if (IQ >= IQ_Lower && (IQ_Upper === null || IQ < IQ_Upper)) {
        return CircleAndSocietyData[i]
      }
    }
    return null
  }

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setShowQuizTitans(false)
      }}
      size={{ base: 'full', md: 'xl' }}
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor={{ base: '#0f0d15', xl: 'transparent' }}
        backgroundImage={{
          base: 'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
        }}
        boxShadow={{
          base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
        }}
        backgroundSize="400% 400%"
        borderRadius="10px"
        overflow={'hidden'}
      >
        <ModalHeader
          as="h3"
          size="lg"
          color="white"
          textAlign="center"
          display={'flex'}
          gap={2}
        >
          Top Rankers
          <Image
            src={Trophy}
            background={'transparent'}
            w={'25px'}
            height={'25px'}
          />
        </ModalHeader>
        <ModalCloseButton color={'white'} />
        <ModalBody>
          {load ? (
            <Loading />
          ) : (
            <TableContainer color={'white'}>
              <Table variant="unstyled" size="lg">
                <Thead>
                  <Tr>
                    <Th textAlign={'center'}>Rank</Th>
                    <Th textAlign={'center'}>Name</Th>
                    <Th textAlign={'center'}>InGameName</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rankers.length > 0 &&
                    rankers.map((ranker, index) => {
                      return (
                        <Tr
                          key={index}
                          _hover={{
                            backgroundImage:
                              'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
                            boxShadow:
                              '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
                          }}
                          cursor={'pointer'}
                          onClick={() => {
                            playClick()
                            navigate(`/profile/${ranker.inGameName}`)
                          }}
                        >
                          <Td textAlign={'center'} px={0}>
                            {ranker.rank}
                          </Td>
                          <Td px={0}>
                            <Flex
                              justifyContent={'center'}
                              alignItems={'center'}
                              w={'100%'}
                              position="relative"
                            >
                              <Heading
                                as="h6"
                                size={'xs'}
                                color={
                                  findSocietyAndCircle(ranker.IQ_score)
                                    ?.textColor
                                }
                                marginTop={'5px'}
                              >
                                {ranker.name}
                              </Heading>
                              <NameLightning
                                boxShadow={
                                  findSocietyAndCircle(ranker.maxIQScore)
                                    ?.boxShadow
                                }
                                MAX_IQ={ranker.maxIQScore}
                              />
                            </Flex>
                          </Td>
                          <Td textAlign={'center'} px={0}>
                            {ranker.inGameName}
                          </Td>
                        </Tr>
                      )
                    })}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              playClick()
              onClose()
              setShowQuizTitans(false)
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default QuizTitansModal

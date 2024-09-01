import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useMediaQuery,
  HStack,
  Text,
  Center,
  Spinner,
} from '@chakra-ui/react'
import useSound from '../../../customHooks/useSound'
import slugify from 'slugify'
import { ICONS_ARTICLE_DIFFICULTY } from '../../../models/articleDifficulty'
import DifficultyLegend from '../../miscellaneous/DIfficultyLegend'
import axios from 'axios'

const SolvedQuizHistory = ({ inGameName, setShowHistory }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { playClick } = useSound()
  const [history, setHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const wordBreak = useMediaQuery('(min-width: 48em)')[0]

  const diffColor = {
    Easy: 'green',
    Medium: 'yellow',
    Hard: 'red',
  }

  useEffect(() => {
    onOpen()
    fetchHistory(1)
  }, [])

  const fetchHistory = async page => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `/api/user/solvedQuizzesHistory?inGameName=${inGameName}&page=${page}`,
      )
      setHistory(response.data.history)
      setCurrentPage(response.data.currentPage)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchHistory(newPage)
    }
  }

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setShowHistory(false)
      }}
      size={{ base: 'full', md: '3xl' }}
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(15, 13, 21, 0.8)"
        borderRadius="xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
      >
        <ModalHeader as="h3" size="lg" color="white" textAlign="center">
          Solved Quiz History
        </ModalHeader>
        <ModalCloseButton color={'white'} />
        <ModalBody
          w={'100%'}
          h={'100%'}
          css={{ '&::-webkit-scrollbar': { display: 'none' } }}
        >
          <DifficultyLegend />
          <Box
            overflowY="auto"
            overflowX="hidden"
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
            h={'100%'}
          >
            <TableContainer
              width={'100%'}
              className="mainBoard"
              p={'10px'}
              h={'100%'}
            >
              <Table variant={'unstyled'} w={'100%'} size="sm">
                <Thead w={'100%'}>
                  <Tr boxShadow={'dark-lg'}>
                    <Th
                      textAlign={'center'}
                      bg={'green.300'}
                      color={'white'}
                      px={1}
                    >
                      PER
                    </Th>
                    <Th textAlign={'center'} bg={'red.300'} px={1}>
                      Article
                    </Th>
                    <Th
                      textAlign={'center'}
                      bg={'blue.300'}
                      display={{ base: 'none', md: 'table-cell' }}
                      px={1}
                    >
                      RQM
                    </Th>
                    <Th textAlign={'center'} bg={'orange.300'} px={1}>
                      Diff
                    </Th>
                  </Tr>
                </Thead>

                <Tbody marginTop={'20px'} className="Entries">
                  {isLoading ? (
                    <Tr>
                      <Td colSpan={4}>
                        <Center py={8}>
                          <Spinner
                            thickness="4px"
                            speed="0.65s"
                            emptyColor="gray.200"
                            color="blue.500"
                            size="xl"
                          />
                        </Center>
                      </Td>
                    </Tr>
                  ) : (
                    history.map(attempt => {
                      const {
                        RQM_score,
                        articleDifficulty,
                        title,
                        article,
                        _id,
                        userPercentile,
                      } = attempt
                      const DifficultyIcon =
                        ICONS_ARTICLE_DIFFICULTY[
                          articleDifficulty.toLowerCase()
                        ]
                      return (
                        <Tr
                          key={_id}
                          onClick={() => {
                            navigate(`/article/${article}/${slugify(title)}`)
                          }}
                          cursor={'pointer'}
                          textColor={'white'}
                        >
                          <Td px={1} fontSize="sm" textAlign={'center'}>
                            {userPercentile?.toFixed(0)}%
                          </Td>
                          <Td textAlign="justify" px={1} fontSize="sm">
                            {`${title?.substring(0, wordBreak ? 75 : 25)}...`}
                          </Td>
                          <Td
                            textAlign="center"
                            display={{ base: 'none', md: 'table-cell' }}
                            fontSize="sm"
                          >
                            {RQM_score}
                          </Td>
                          <Td
                            textAlign="center"
                            color={diffColor[articleDifficulty]}
                            px={1}
                            fontSize="sm"
                            justifyContent={'center'}
                            alignItems={'center'}
                            display={'flex'}
                          >
                            {DifficultyIcon && <DifficultyIcon />}
                          </Td>
                        </Tr>
                      )
                    })
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </ModalBody>
        <ModalFooter>
          <HStack justifyContent="center" mt={4} spacing={4}>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              size="sm"
            >
              Previous
            </Button>
            <Text color="white">
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              size="sm"
            >
              Next
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SolvedQuizHistory

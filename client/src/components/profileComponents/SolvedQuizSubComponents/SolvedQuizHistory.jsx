import {
  Box,
  Button,
  Flex,
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
} from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useSound from '../../../customHooks/useSound'

const SolvedQuizHistory = ({ solvedHistory, setShowHistory }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { playClick } = useSound()
  const { history } = solvedHistory

  const diffColor = {
    Easy: 'green.300',
    Medium: 'yellow.300',
    Hard: 'red.300',
  }
  useEffect(() => {
    onOpen()
  }, [])

  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={() => {
          onClose()
          setShowHistory(false)
        }}
        size={{ base: 'full', md: '3xl' }}
      >
        <ModalOverlay />
        <ModalContent
          // background="linear-gradient(-45deg, #092635, #9EC8B9, #1B4242, #9EC8B9)"
          backgroundColor={{ base: '#0f0d15' }}
          backgroundImage={{
            base: 'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
          }}
          boxShadow={{
            base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
          }}
          backgroundSize="400% 400%"
          borderRadius="10px"
          overflow={'hidden'}
          //boxShadow="0 0 10px rgba(0, 0, 0, 0.5)" // Added boxShadow to make it standout
        >
          <ModalHeader as="h3" size="lg" color="white" textAlign="center">
            Latest 50 Solved Quiz History
          </ModalHeader>
          <ModalCloseButton color={'white'} />
          <ModalBody>
            <Box
              maxH={{ base: '80vh', md: '50vh' }}
              overflowY="scroll"
              css={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              <TableContainer width={'100%'} className="mainBoard" p={'10px'}>
                <Table variant={'unstyled'} w={'100%'}>
                  <Thead w={'100%'}>
                    <Tr boxShadow={'dark-lg'}>
                      <Th
                        textAlign={'center'}
                        bg={'orange.300'}
                        color={'white'}
                        display={{ base: 'none', md: 'block' }}
                        px={0}
                      >
                        Serial No.
                      </Th>
                      <Th
                        textAlign={'center'}
                        bg={'green.300'}
                        color={'white'}
                        px={0}
                      >
                        Percentile
                      </Th>
                      <Th textAlign={'center'} bg={'red.300'} px={0}>
                        Article
                      </Th>
                      <Th
                        textAlign={'center'}
                        bg={'blue.300'}
                        display={{ base: 'none', md: 'block' }}
                        px={0}
                      >
                        RQM Score
                      </Th>
                      <Th textAlign={'center'} bg={'orange.300'} px={0}>
                        Article Diff
                      </Th>
                    </Tr>
                  </Thead>

                  <Tbody marginTop={'20px'} className="Entries">
                    {history?.length > 0 &&
                      history.map((attempt, index) => {
                        const {
                          RQM_score,
                          articleDifficulty,
                          title,
                          article,
                          _id,
                          userPercentile,
                          newsArticle,
                        } = attempt

                        return (
                          <Tr // Clickable row to the profile of the user
                            height={'80px'}
                            key={_id}
                            onClick={() => {
                              navigate(`/article/${article}`)
                            }}
                            _hover={{
                              backgroundImage:
                                'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
                              boxShadow:
                                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
                            }}
                            cursor={'pointer'}
                            textColor={'white'}
                          >
                            <Td
                              textAlign={'center'}
                              display={{ base: 'none', md: 'block' }}
                            >
                              <Flex
                                justifyContent={'center'}
                                alignItems={'center'}
                                bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                                p={2}
                                gap={'35px'}
                                borderRadius="md"
                              >
                                {index + 1}
                              </Flex>
                            </Td>
                            <Td>{userPercentile?.toFixed(2)}%</Td>
                            <Td textAlign="center">
                              {`${title?.substring(0, 15)}...`}
                            </Td>
                            <Td
                              textAlign="center"
                              display={{ base: 'none', md: 'block' }}
                            >
                              {RQM_score}
                            </Td>
                            <Td
                              textAlign="center"
                              color={
                                diffColor[
                                  articleDifficulty === 'Easy'
                                    ? 'Easy'
                                    : articleDifficulty === 'Medium'
                                    ? 'Medium'
                                    : 'Hard'
                                ]
                              }
                            >
                              {articleDifficulty}
                            </Td>
                          </Tr>
                        )
                      })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                playClick()
                onClose()
                setShowHistory(false)
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SolvedQuizHistory

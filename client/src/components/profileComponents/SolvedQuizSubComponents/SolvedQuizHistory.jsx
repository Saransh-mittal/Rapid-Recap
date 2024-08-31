import React, { useEffect } from 'react'
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
} from '@chakra-ui/react'
import useSound from '../../../customHooks/useSound'
import slugify from 'slugify'
import { ICONS_ARTICLE_DIFFICULTY } from '../../../models/articleDifficulty'
import DifficultyLegend from '../../miscellaneous/DIfficultyLegend'

const SolvedQuizHistory = ({ solvedHistory, setShowHistory }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { playClick } = useSound()
  const { history } = solvedHistory
  const wordBreak = useMediaQuery('(min-width: 48em)')[0]

  const diffColor = {
    Easy: 'green',
    Medium: 'yellow',
    Hard: 'red',
  }

  useEffect(() => {
    onOpen()
  }, [])

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
          Latest 50 Solved Quiz History
        </ModalHeader>
        <ModalCloseButton color={'white'} />
        <ModalBody w={'100%'}>
          <DifficultyLegend />
          <Box
            overflowY="auto"
            overflowX="hidden"
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            <TableContainer width={'100%'} className="mainBoard" p={'10px'}>
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
                  {history?.length > 0 &&
                    history.map((attempt, index) => {
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
  )
}

export default SolvedQuizHistory

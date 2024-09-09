// LeaderboardTable.js
import React, { forwardRef } from 'react'
import {
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Medal, Trophy, Crown } from 'lucide-react'

const MotionBox = motion(Box)

const LeaderboardTable = forwardRef(({ data }, ref) => {
  return (
    <Box
      maxHeight="400px"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '0px',
        },
        '&::-webkit-scrollbar-track': {
          width: '0px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'transparent',
          borderRadius: '24px',
        },
      }}
    >
      <Table variant="unstyled">
        <Thead position="sticky" top={0} zIndex={1} bg="gray.800">
          <Tr>
            <Th
              color="white"
              fontSize={{ base: 'xs', md: 'lg' }}
              px={{ base: 4, md: 6 }}
              textAlign={'center'}
            >
              Rank
            </Th>
            <Th
              color="white"
              fontSize={{ base: 'xs', md: 'lg' }}
              px={6}
              textAlign={'center'}
            >
              In-Game-Name
            </Th>
            <Th
              color="white"
              fontSize={{ base: 'xs', md: 'lg' }}
              px={6}
              textAlign={'center'}
              isNumeric
            >
              Score
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((player, index) => (
            <MotionBox
              as={Tr}
              key={`${player.rank}-${player.inGameName}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              _hover={{
                bg: 'whiteAlpha.100',
                transition: 'background-color 0.2s',
              }}
              borderBottom="1px solid"
              borderColor="whiteAlpha.300"
            >
              <Td textAlign={'center'}>
                {player.rank === 1 && (
                  <Flex justifyContent={'center'}>
                    <Crown size={24} color="gold" />
                  </Flex>
                )}
                {player.rank === 2 && (
                  <Flex justifyContent={'center'}>
                    <Trophy size={24} color="silver" />
                  </Flex>
                )}
                {player.rank === 3 && (
                  <Flex justifyContent={'center'}>
                    <Medal size={24} color="#CD7F32" />
                  </Flex>
                )}
                {player.rank > 3 && (
                  <Text fontSize="xl" fontWeight="bold">
                    {player.rank}
                  </Text>
                )}
              </Td>
              <Td textAlign={'center'}>
                <Text fontSize="xl" fontWeight="semibold">
                  {player.inGameName}
                </Text>
              </Td>
              <Td textAlign={'center'} isNumeric>
                <Text fontSize="xl" fontWeight="bold">
                  {player.score}
                </Text>
              </Td>
            </MotionBox>
          ))}
          {data && data.length > 0 && (
            <Tr>
              <Td ref={ref} style={{ height: '20px' }} />
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  )
})

export default LeaderboardTable

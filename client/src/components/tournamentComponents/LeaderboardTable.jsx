import React from 'react'
import { Text, Table, Thead, Tbody, Tr, Th, Td, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { Medal, Trophy, Crown } from 'lucide-react'
const MotionBox = motion(Box)
const LeaderboardTable = ({ data }) => {
  return (
    <Table variant="unstyled">
      <Thead>
        <Tr>
          <Th color="white" fontSize={{ base: 'sm', md: 'lg' }}>
            Rank
          </Th>
          <Th color="white" fontSize="lg">
            Username
          </Th>
          <Th color="white" fontSize="lg" isNumeric>
            Score
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((player, index) => (
          <MotionBox
            as={Tr}
            key={player.rank}
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
            <Td>
              {player.rank === 1 && <Crown size={24} color="gold" />}
              {player.rank === 2 && <Trophy size={24} color="silver" />}
              {player.rank === 3 && <Medal size={24} color="#CD7F32" />}
              {player.rank > 3 && (
                <Text fontSize="xl" fontWeight="bold">
                  {player.rank}
                </Text>
              )}
            </Td>
            <Td>
              <Text fontSize="xl" fontWeight="semibold">
                {player.username}
              </Text>
            </Td>
            <Td isNumeric>
              <Text fontSize="xl" fontWeight="bold">
                {player.score}
              </Text>
            </Td>
          </MotionBox>
        ))}
      </Tbody>
    </Table>
  )
}

export default LeaderboardTable

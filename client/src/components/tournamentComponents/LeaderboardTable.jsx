import React from 'react'
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
const LeaderboardTable = ({ data }) => {
  return (
    <Table variant="unstyled">
      <Thead>
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
            Username
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
                {player.username}
              </Text>
            </Td>
            <Td textAlign={'center'} isNumeric>
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

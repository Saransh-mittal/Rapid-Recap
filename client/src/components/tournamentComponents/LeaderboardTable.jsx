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
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Medal, Trophy, Crown } from 'lucide-react'

const MotionBox = motion(Box)

const LeaderboardTable = forwardRef(({ data }, ref) => {
  return (
    <Box
      maxHeight="500px"
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
              Player
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
                    <Crown color="gold" width={'20px'} height={'20px'} />
                  </Flex>
                )}
                {player.rank === 2 && (
                  <Flex justifyContent={'center'}>
                    <Trophy color="silver" width={'20px'} height={'20px'} />
                  </Flex>
                )}
                {player.rank === 3 && (
                  <Flex justifyContent={'center'}>
                    <Medal color="#CD7F32" width={'20px'} height={'20px'} />
                  </Flex>
                )}
                {player.rank > 3 && (
                  <Text fontSize={{ base: 'xs', md: 'lg' }} fontWeight="bold">
                    {player.rank}
                  </Text>
                )}
              </Td>
              <Td>
                <VStack spacing={0} align={'left'} w={'fit-content'} ml={'25%'}>
                  <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    fontWeight="semibold"
                    textAlign={'left'}
                  >
                    {player.name}
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.400">
                    @{player.inGameName}
                  </Text>
                </VStack>
              </Td>
              <Td textAlign={'center'} isNumeric>
                <Text fontSize={{ base: 'xs', md: 'lg' }} fontWeight="bold">
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

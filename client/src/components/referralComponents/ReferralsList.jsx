import React from 'react'
import {
  Box,
  Text,
  Button,
  HStack,
  useDisclosure,
  Collapse,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Tag,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import moment from 'moment'

const ReferralsList = ({ referrals, isLoading }) => {
  const { isOpen, onToggle } = useDisclosure()

  if (!referrals?.length && !isLoading) return null

  return (
    <Box mt={6}>
      <Button
        onClick={onToggle}
        variant="ghost"
        width="100%"
        color="whiteAlpha.900"
        leftIcon={isOpen ? <ChevronUp /> : <ChevronDown />}
        _hover={{ bg: 'rgba(255,255,255,0.1)' }}
        bgGradient="linear(to-r, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))"
      >
        {isOpen ? 'Hide' : 'Show'} Referral Details ({referrals?.length || 0})
      </Button>

      <Collapse in={isOpen}>
        <Box
          mt={4}
          overflowX="auto"
          bg="rgba(255,255,255,0.03)"
          rounded="xl"
          border="1px solid"
          borderColor="rgba(255,255,255,0.1)"
          backdropFilter="blur(10px)"
          p={4}
        >
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th color="whiteAlpha.600">User</Th>
                <Th color="whiteAlpha.600">Date</Th>
                <Th color="whiteAlpha.600">Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading
                ? [...Array(3)].map((_, idx) => (
                    <Tr key={idx}>
                      <Td>
                        <HStack>
                          <SkeletonCircle size="8" />
                          <Skeleton height="20px" width="100px" />
                        </HStack>
                      </Td>
                      <Td>
                        <Skeleton height="20px" width="100px" />
                      </Td>
                      <Td>
                        <Skeleton height="20px" width="60px" />
                      </Td>
                    </Tr>
                  ))
                : referrals.map(referral => (
                    <Tr key={referral._id}>
                      <Td>
                        <HStack>
                          <Avatar
                            size="sm"
                            name={referral.user.inGameName}
                            src={referral.user.pic}
                          />
                          <Text color="whiteAlpha.900">
                            {referral.user.inGameName}
                          </Text>
                        </HStack>
                      </Td>
                      <Td color="whiteAlpha.900">
                        {moment(referral.date).format('MMM DD, YYYY')}
                      </Td>
                      <Td>
                        <Tag
                          size="sm"
                          variant="subtle"
                          colorScheme={
                            referral.status === 'complete' ? 'green' : 'yellow'
                          }
                        >
                          {referral.status}
                        </Tag>
                      </Td>
                    </Tr>
                  ))}
            </Tbody>
          </Table>
        </Box>
      </Collapse>
    </Box>
  )
}

export default ReferralsList

import React from 'react'
import {
  Box,
  Flex,
  Text,
  Avatar,
  useColorModeValue,
  Button,
} from '@chakra-ui/react'

const FriendRequestItem = ({ request, onAccept, onReject }) => {
  const bgColor = useColorModeValue('#2a2438', '#2a2438')
  const textColor = useColorModeValue('white', 'white')
  const subTextColor = useColorModeValue('#a0a0a0', '#a0a0a0')
  const iqColor = useColorModeValue('#ffd700', '#ffd700')

  const handleAccept = () => onAccept(request._id)
  const handleReject = () => onReject(request._id)

  return (
    <Box
      bg={bgColor}
      borderRadius="md"
      p={2}
      mb={2}
      boxShadow="md"
      color={textColor}
      w={'100%'}
    >
      <Flex>
        <Flex alignItems={'flex-start'} h={'100%'}>
          <Avatar
            size="sm"
            name={request.from.name}
            src={request.from.pic}
            mt={1}
            mr={3}
          />
        </Flex>
        <Box flex={1} mr={2}>
          <Flex alignItems="baseline" flexDirection={'column'}>
            <Text fontWeight="bold" fontSize="sm" mr={1} mb={0}>
              {request.from.name}
            </Text>
            <Text fontSize="xs" color={subTextColor} mb={0}>
              @{request.from.inGameName}
            </Text>
          </Flex>
          <Text fontSize="xs" color={iqColor} mb={0}>
            IQ: {request.from.IQ_score}
          </Text>
        </Box>
        <Flex alignItems={'center'} gap={2}>
          <Button colorScheme="green" size="xs" mr={1} onClick={handleAccept}>
            Accept
          </Button>
          <Button colorScheme="red" size="xs" onClick={handleReject}>
            Reject
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default FriendRequestItem

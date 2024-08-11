import { Flex, Heading, Image, Text } from '@chakra-ui/react'
import React from 'react'

const LazyNotificationContent = ({
  selectedNotification,
  user,
  formattedDate,
}) => {
  return (
    <>
      {/* Circular image */}

      {/* Greetings section */}
      <Flex mt={8} ml={4} mb={2}>
        <Heading as="h3" size="md" color="teal">
          Hello, {user.name || 'User'}!
        </Heading>
      </Flex>

      {/* Image for update */}
      {selectedNotification.img && (
        <Flex justifyContent="center">
          <Image
            src={selectedNotification.img}
            mt={3}
            alt="Notification Image"
            width="12rem"
            height="12rem"
            // borderRadius="50%"
            borderRadius={'2px'}
            objectFit="cover"
            objectPosition="center center"
          />
        </Flex>
      )}

      {/* Main content */}
      <Flex flexDirection="column" alignItems="center" marginTop={'30px'}>
        <div
          dangerouslySetInnerHTML={{
            __html: selectedNotification.mainText,
          }}
          style={{
            fontSize: 'lg',
            color: 'gray.400',
            fontStyle: 'italic',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        />
        <Text fontSize="sm" color="gray.600">
          {formattedDate}
        </Text>
      </Flex>
    </>
  )
}

export default LazyNotificationContent

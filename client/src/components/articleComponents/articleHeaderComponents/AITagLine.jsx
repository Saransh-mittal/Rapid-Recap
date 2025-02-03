import { Flex, Text, Icon } from '@chakra-ui/react'
import React from 'react'
// If you have access to react-icons, you could import:
// import { RiAiLine } from 'react-icons/ri'

const AITagLine = ({ t }) => {
  return (
    <Flex
      align="center"
      gap={2}
      px={3}
      py={1.5}
      bg="purple.50"
      color="purple.700"
      rounded="md"
      fontSize="sm"
      fontWeight="medium"
      w="fit-content"
      borderWidth="1px"
      borderColor="purple.100"
      transition="all 0.2s"
      _hover={{
        bg: 'purple.100',
        borderColor: 'purple.200',
      }}
    >
      <Text>{t('Enhanced by Rapid Recap AI')}</Text>
    </Flex>
  )
}

export default AITagLine

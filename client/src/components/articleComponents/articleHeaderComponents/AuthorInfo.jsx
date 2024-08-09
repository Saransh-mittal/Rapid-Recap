import React from 'react'
import { Flex, Text, Highlight } from '@chakra-ui/react'

const AuthorInfo = React.memo(({ author, selectedLanguage }) => (
  <Flex fontSize={['lg', 'lg', 'xl']} gap={1} w={{ md: '75%', lg: 'auto' }}>
    <Flex height="fit-content">
      <Highlight
        query="Author"
        styles={{
          px: '2',
          py: '1',
          rounded: 'full',
          bg: '#F7EFE5',
          fontWeight: 'bold',
        }}
      >
        Author
      </Highlight>
    </Flex>

    <Flex>{'  : '}</Flex>

    <Flex>
      <Text mb={0} fontWeight={'bold'}>
        {author[selectedLanguage]}
      </Text>
    </Flex>
  </Flex>
))

export default AuthorInfo

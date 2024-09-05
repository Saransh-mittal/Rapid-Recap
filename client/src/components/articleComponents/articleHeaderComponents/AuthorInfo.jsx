import React from 'react'
import { Flex, Text, Highlight } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const AuthorInfo = React.memo(({ author, selectedLanguage }) => {
  const { t } = useTranslation('AuthorInfo')
  return (
    <Flex
      fontSize={['lg', 'lg', 'xl']}
      gap={1}
      w={{ md: '75%', lg: 'auto' }}
      alignItems={{ base: 'flex-start', md: 'center' }}
      h={'100%'}
    >
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
          {t('authorLabel')}
        </Highlight>
      </Flex>

      <Flex mt={{ base: '3px', md: 0 }}>{'  : '}</Flex>

      <Flex h={'100%'} justifyContent={'center'} alignItems={'center'}>
        <Text mb={0} fontWeight={'bold'} lineHeight={'23px'}>
          {author[selectedLanguage]}
        </Text>
      </Flex>
    </Flex>
  )
})

export default AuthorInfo

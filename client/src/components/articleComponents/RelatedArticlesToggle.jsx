import React from 'react'
import { Flex, Box, Tooltip } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const RelatedArticlesToggle = React.memo(({ showRelated, onToggle }) => {
  const { t } = useTranslation('RelatedArticlesToggle')
  return (
    <Box
      as="button"
      display="flex"
      alignItems="center"
      bg="rgba(255, 255, 255, 0.1)"
      borderRadius="full"
      p="2px"
      cursor="pointer"
      onClick={onToggle}
      border="1px solid"
      borderColor="whiteAlpha.300"
      _hover={{ borderColor: 'whiteAlpha.500' }}
    >
      <Box
        px={2}
        py={1}
        borderRadius="full"
        bg={!showRelated ? 'white' : 'transparent'}
        color={!showRelated ? 'blue.500' : 'white'}
        fontWeight="bold"
        transition="all 0.3s"
        fontSize={{ base: '0.8rem', lg: '1.2rem' }}
        textTransform={'uppercase'}
      >
        {t('relatedArticles')}
      </Box>
      <Box
        px={2}
        py={1}
        borderRadius="full"
        bg={showRelated ? 'white' : 'transparent'}
        color={showRelated ? 'blue.500' : 'white'}
        fontWeight="bold"
        transition="all 0.3s"
        fontSize={{ base: '0.8rem', lg: '1.2rem' }}
        textTransform={'uppercase'}
      >
        {t('remmondedArticles')}
      </Box>
    </Box>
  )
})

export default RelatedArticlesToggle

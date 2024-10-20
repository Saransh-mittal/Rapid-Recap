import React from 'react'
import { Box, Flex, Text, useBreakpointValue } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const OnboardingArticleHeader = ({ title, author, readTime }) => {
  const { t } = useTranslation('OnboardingArticleHeader')

  const titleFontSize = useBreakpointValue({
    base: 'xl',
    md: '2xl',
    lg: '2.2rem',
  })
  const authorFontSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const readTimeFontSize = useBreakpointValue({ base: 'xs', md: 'sm' })

  return (
    <Box
      bg="linear-gradient(135deg, rgba(42, 47, 79, 0.7) 0%, rgba(145, 127, 179, 0.7) 100%)"
      px={{ base: 3, md: 4, lg: 6 }}
      py={{ base: 2, md: 3 }}
      borderTopRadius="xl"
      w="100%"
    >
      <Text
        fontSize={titleFontSize}
        mb={2}
        fontWeight="bold"
        letterSpacing="1px"
        color="white"
      >
        {title}
      </Text>
      <Flex
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', md: 'center' }}
        flexDirection={{ base: 'column', md: 'row' }}
        mt={2}
      >
        <Text fontSize={authorFontSize} color="whiteAlpha.900">
          {t('by')} {author}
        </Text>
        <Text
          fontSize={readTimeFontSize}
          color="whiteAlpha.800"
          mt={{ base: 1, md: 0 }}
        >
          {readTime} {t('minRead')}
        </Text>
      </Flex>
    </Box>
  )
}

export default OnboardingArticleHeader

import React from 'react'
import {
  Box,
  VStack,
  Text,
  Image,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import OnboardingQuizButton from './OnboardingQuizButton'
import OnboardingArticleHeader from './OnboardingArticleHeader'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const ArticleReading = ({ onNext }) => {
  const { t } = useTranslation('ArticleReading')

  const article = {
    title: 'Discovering Paris',
    author: 'Rapid Recap Team',
    image: '/images/paris.jpg',
    content: `Paris, the capital of France, is a global center for art, fashion, gastronomy, and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine. Beyond such landmarks as the Eiffel Tower and the 12th-century, Gothic Notre-Dame cathedral, the city is known for its cafe culture and designer boutiques along the Rue du Faubourg Saint-Honoré. The city's renowned museums include the Louvre and the Musée d'Orsay.`,
    readTime: '5',
  }

  const padding = useBreakpointValue({ base: 4, md: 8 })
  const maxWidth = useBreakpointValue({ base: '100%', md: '800px' })
  const fontSize = useBreakpointValue({ base: 'md', md: 'lg' })

  return (
    <Box
      maxH="90vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      w="100%"
    >
      <Box w="95%" maxW={maxWidth} mt={{ base: '0.5rem', md: '1.5rem' }}>
        <OnboardingArticleHeader
          title={article.title}
          author={article.author}
          readTime={article.readTime}
        />
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          bg="rgba(26, 21, 39, 0.8)"
          p={padding}
          borderBottomRadius="xl"
          width="100%"
          overflowY="auto"
        >
          <VStack spacing={6} align="stretch">
            <Image
              src={article.image}
              alt={article.title}
              borderRadius="md"
              objectFit="cover"
              width="100%"
              height={{ base: '200px', md: '300px' }}
            />
            <Text fontSize={fontSize} color="white" lineHeight="1.8">
              {article.content}
            </Text>
            <Flex justifyContent="center" mt={4}>
              <OnboardingQuizButton onClick={onNext} />
            </Flex>
          </VStack>
        </MotionBox>
      </Box>
    </Box>
  )
}

export default ArticleReading

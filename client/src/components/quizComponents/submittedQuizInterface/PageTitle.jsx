import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const PageTitle = ({ isTournament = false }) => {
  const { t } = useTranslation('SubmittedQuizInterface')

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      textAlign="center"
      mb={8}
      zIndex={1}
      alignItems={'center'}
      display={'flex'}
      flexDirection={'column'}
    >
      <Heading
        fontSize={{ base: '3xl', md: '4xl' }}
        fontWeight="bold"
        bgGradient={
          isTournament
            ? 'linear(to-r, yellow.200, orange.200)'
            : 'linear(to-r, purple.200, pink.200)'
        }
        bgClip="text"
        w={'fit-content'}
      >
        {t('quizCompleted')}
      </Heading>
      <Text
        color={isTournament ? 'yellow.200' : 'purple.200'}
        mt={2}
        fontSize="sm"
      >
        {t('masterfullyDone')}
      </Text>
    </MotionBox>
  )
}

export default PageTitle

import { Container, Heading } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'

const QuizExpired = ({ css }) => {
  const { t } = useTranslation('QuizExpired')
  return (
    <Container css={css} margin={'5px'} mb={5} height={'100px'}>
      <Heading color={'red'}>{t('quizExpired')}</Heading>
    </Container>
  )
}

export default QuizExpired

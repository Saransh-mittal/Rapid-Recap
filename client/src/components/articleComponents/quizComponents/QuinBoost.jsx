import { Flex } from '@chakra-ui/react'
import React from 'react'
import Bubbles from '../../miscellaneous/bubbles'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const QuinBoost = () => {
  const { t } = useTranslation('QuinBoost')
  return (
    <Flex marginTop={'5px'} alignItems="center">
      <Bubbles />
      <motion.div
        style={{
          color: '#9CAFAA',
          fontWeight: 'bold',
          marginRight: '10px',
          fontSize: '24px', // Increase font size
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)', // Add text shadow for stunning effect
        }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {t('QuinBoost')}
      </motion.div>
      <motion.div
        style={{
          color: '#F2D7D9',
          fontWeight: 'bold',
          fontSize: '28px', // Increase font size
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)', // Add text shadow for stunning effect
        }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {t('Multiplier')}
      </motion.div>
    </Flex>
  )
}

export default QuinBoost

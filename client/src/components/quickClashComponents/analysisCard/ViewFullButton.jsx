import React, { memo } from 'react'
import { Button } from '@chakra-ui/react'
import { Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionButton = motion(Button)

const ViewFullButton = ({
  onClick,
  userIsWinner,
  isTie,
  display = 'block',
  width = '70%',
  marginTop = 'auto',
  marginLeft = 'auto',
  marginRight = 'auto',
}) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionButton
      display={display}
      marginTop={marginTop}
      marginLeft={marginLeft}
      marginRight={marginRight}
      w={width}
      onClick={onClick}
      colorScheme={userIsWinner ? 'green' : isTie ? 'blue' : 'red'}
      leftIcon={<Eye size={14} />}
      size="xs"
      fontWeight="bold"
      bgGradient={
        userIsWinner
          ? 'linear(to-r, green.400, teal.500)'
          : isTie
          ? 'linear(to-r, blue.400, cyan.500)'
          : 'linear(to-r, red.400, orange.500)'
      }
      color="white"
      _hover={{
        bgGradient: userIsWinner
          ? 'linear(to-r, green.300, teal.400)'
          : isTie
          ? 'linear(to-r, blue.300, cyan.400)'
          : 'linear(to-r, red.300, orange.400)',
        transform: 'translateY(-1px)',
        boxShadow: 'md',
      }}
      _active={{
        bgGradient: userIsWinner
          ? 'linear(to-r, green.500, teal.600)'
          : isTie
          ? 'linear(to-r, blue.500, cyan.600)'
          : 'linear(to-r, red.500, orange.600)',
        transform: 'translateY(0)',
      }}
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {t('View Full Analysis')}
    </MotionButton>
  )
}

export default memo(ViewFullButton)

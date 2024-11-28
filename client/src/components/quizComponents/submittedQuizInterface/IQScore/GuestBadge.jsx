import React from 'react'
import { Box, Icon, Text, Tooltip, Badge } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setIsOpen } from '../../../../redux/quizSlice'

const MotionBadge = motion(Badge)

export const GuestBadge = React.memo(({ t, inGameName }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <Tooltip label={t('loginToTrackIQ')} placement="bottom" hasArrow>
      <Box mb={10}>
        <MotionBadge
          variant="subtle"
          colorScheme="yellow"
          rounded="full"
          px={3}
          py={1}
          fontSize="xs"
          display="flex"
          alignItems="center"
          gap={2}
          cursor="pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          _hover={{
            bg: 'yellow.100',
            color: 'yellow.800',
          }}
          onClick={() => {
            navigate(`/profile/${inGameName}`)
            dispatch(setIsOpen(false))
          }}
        >
          <Text>{t('expectedScore')}</Text>
          <Icon as={LogIn} boxSize={3} />
        </MotionBadge>
      </Box>
    </Tooltip>
  )
})

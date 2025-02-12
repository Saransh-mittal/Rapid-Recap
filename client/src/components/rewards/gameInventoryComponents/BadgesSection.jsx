import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Grid,
  VStack,
  Heading,
  Text,
  Flex,
  useToast,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import TournamentBadge from '../../tournamentComponents/TournamentBadges'

const BadgesSection = () => {
  const { t } = useTranslation('BadgesSection')
  const { user } = useSelector(state => state.auth)
  const toast = useToast()

  const sortedBadges = useMemo(() => {
    return user?.badges
      ? [...user.badges].sort((a, b) => b.tournamentNumber - a.tournamentNumber)
      : []
  }, [user?.badges])

  const handleBadgeSelect = useCallback(
    async badge => {
      try {
        const response = await axios.post('/api/user/update-displayed-badge', {
          tournamentNumber: badge.tournamentNumber,
          badgeName: badge.badgeName,
          text: badge.text,
        })

        toast({
          title: t('notifications.updateSuccess.title'),
          description: t('notifications.updateSuccess.description'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        toast({
          title: t('notifications.updateError.title'),
          description: t('notifications.updateError.description'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast, t],
  )

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <VStack spacing="6" align="stretch" mt="4">
      {sortedBadges.length > 0 ? (
        <Box>
          <Heading
            size="md"
            mb="4"
            bgGradient="linear(to-r, purple.300, pink.300)"
            bgClip="text"
          >
            {t('header.title')}
          </Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap="12" align="center">
            {sortedBadges.map((badge, index) => (
              <motion.div
                key={`${badge.tournamentNumber}-${badge.badgeName}-${badge.text}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <TournamentBadge
                  tournamentNumber={badge.tournamentNumber}
                  rank={badge.rank}
                  name={user?.name}
                  inGameName={user?.inGameName}
                  participantCnt={badge.participantCnt}
                  size="lg"
                  badgeName={{
                    name: badge.badgeName,
                    text: badge.text,
                  }}
                  onClick={() => handleBadgeSelect(badge)}
                  t={t}
                />
              </motion.div>
            ))}
          </Grid>
        </Box>
      ) : (
        <Flex
          justify="center"
          align="center"
          h="40vh"
          direction="column"
          spacing={4}
        >
          <Shield size={48} opacity={0.5} />
          <Text mt={4} color="gray.500">
            {t('empty.noBadges')}
          </Text>
        </Flex>
      )}
    </VStack>
  )
}

export default BadgesSection

// TournamentRewardsModal.jsx
import React, { useMemo } from 'react'
import {
  Modal,
  ModalContent,
  ModalCloseButton,
  Box,
  VStack,
  Text,
  Container,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { badgeConfig } from '../../../models/badgeConfig'
import BadgeCard from './BadgeCard'
import AchievementBadgesSection from './AchievementBadgesSection'
import { useTranslation } from 'react-i18next'

const ACHIEVEMENT_BADGES = [
  { type: 'TOP_5' },
  { type: 'TOP_10' },
  { type: 'TOP_25' },
  { type: 'QUIZ_WARRIOR' },
].map(badge => ({
  ...badge,
  badge: badgeConfig[badge.type],
}))

// Memoized components
const SectionTitle = React.memo(({ children }) => {
  const titleStyles = useMemo(
    () => ({
      fontSize: { base: '2xl', md: '3xl' },
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      position: 'relative',
      mb: 8,
      _after: {
        content: '""',
        position: 'absolute',
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '2px',
        bgGradient: 'linear(to-r, transparent, purple.500, transparent)',
      },
    }),
    [],
  )

  return (
    <Text
      as={motion.h2}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      {...titleStyles}
    >
      {children}
    </Text>
  )
})

SectionTitle.displayName = 'SectionTitle'

// Memoized grid section component
const GridSection = React.memo(({ section }) => {
  const gridStyles = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: {
        base: '1fr',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)',
        xl: 'repeat(4, 1fr)',
      },
      gap: 8,
      w: 'full',
      maxW: {
        base: '320px',
        md: '680px',
        lg: '1020px',
        xl: '1360px',
      },
      mx: 'auto',
      px: 4,
    }),
    [],
  )

  return (
    <Box key={section.title} w="full">
      <SectionTitle>{section.title}</SectionTitle>
      <Box {...gridStyles}>
        {section.badges.map((badge, index) => {
          const isMainBadge = badge.type === 'RANK_1' || badge.type === 'ACE'
          return (
            <Box
              key={badge.type}
              gridColumn={{
                base: '1',
                md: isMainBadge ? '1 / -1' : 'auto',
                lg: 'auto',
              }}
            >
              <BadgeCard
                badge={badgeConfig[badge.type]}
                powerups={badge.powerups}
                delay={0.2 * index}
                isHighlighted={isMainBadge}
              />
            </Box>
          )
        })}
      </Box>
    </Box>
  )
})

GridSection.displayName = 'GridSection'

// Main modal component
const TournamentRewardsModal = React.memo(
  ({ isOpen, onClose }) => {
    const { t } = useTranslation('rewards')
    const closeButtonStyles = useMemo(
      () => ({
        color: 'white',
        size: 'lg',
        p: 5,
        bg: 'whiteAlpha.100',
        borderRadius: 'full',
        _hover: {
          bg: 'whiteAlpha.200',
        },
        zIndex: 2,
      }),
      [],
    )
    // Extracted constants
    const MAIN_SECTIONS = [
      {
        title: t('modal.sections.rankings'),
        badges: [
          {
            type: 'RANK_1',
            powerups: [t('rankings.RANK_1.powerup')],
          },
          {
            type: 'RANK_2',
            powerups: [t('rankings.RANK_2.powerup')],
          },
          {
            type: 'RANK_3',
            powerups: [t('rankings.RANK_3.powerup')],
          },
        ],
      },
      {
        title: t('modal.sections.champions'),
        badges: [
          {
            type: 'ACE',
            powerups: [
              t('champions.ACE.powerups.0'),
              t('champions.ACE.powerups.1'),
            ],
          },
          {
            type: 'PRO',
            powerups: [t('champions.PRO.powerups.0')],
          },
          {
            type: 'CHAMP',
            powerups: [t('champions.CHAMP.powerups.0')],
          },
        ],
      },
    ]
    const containerStyles = useMemo(
      () => ({
        maxW: '7xl',
        py: { base: 12, md: 20 },
        px: { base: 4, md: 8 },
      }),
      [],
    )

    return (
      <>
        {isOpen && (
          <Modal
            isOpen={true}
            onClose={onClose}
            size="full"
            motionPreset="none"
          >
            <ModalContent
              bg="rgba(13, 12, 34, 0.98)"
              boxShadow="none"
              my={0}
              mx={0}
            >
              <ModalCloseButton {...closeButtonStyles} />

              <Container {...containerStyles}>
                <VStack spacing={{ base: 12, md: 16 }}>
                  <VStack spacing={4}>
                    <Text
                      as={motion.h1}
                      initial={{ opacity: 0, y: -30 }}
                      animate={{ opacity: 1, y: 0 }}
                      fontSize={{ base: '4xl', md: '5xl' }}
                      fontWeight="bold"
                      bgGradient="linear(to-r, purple.300, purple.100, yellow.200)"
                      bgClip="text"
                      textAlign="center"
                    >
                      {t('modal.title')}
                    </Text>
                    <Text
                      as={motion.p}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      fontSize={{ base: 'lg', md: 'xl' }}
                      color="whiteAlpha.900"
                      maxW="xl"
                      textAlign="center"
                    >
                      {t('modal.subtitle')}
                    </Text>
                  </VStack>

                  {MAIN_SECTIONS.map(section => (
                    <GridSection key={section.title} section={section} />
                  ))}

                  <Box w="full" mt={8}>
                    <AchievementBadgesSection badges={ACHIEVEMENT_BADGES} />
                  </Box>
                </VStack>
              </Container>
            </ModalContent>
          </Modal>
        )}
      </>
    )
  },
  (prevProps, nextProps) => prevProps.isOpen === nextProps.isOpen,
)

TournamentRewardsModal.displayName = 'TournamentRewardsModal'

export default TournamentRewardsModal

import React, { useState, Suspense } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Spinner,
  Flex,
  useMediaQuery,
} from '@chakra-ui/react'

import { useTranslation } from 'react-i18next'

const ButtonGradient = React.lazy(() =>
  import('../../../assets/svg/ButtonGradient'),
)
const Button = React.lazy(() => import('../../miscellaneous/ButtonComponent'))
const TournamentModal = React.lazy(() => import('./TournamentModal'))
const QuizReport = React.lazy(() => import('../../quizComponents/QuizReport'))

const TournamentSelectorDrawer = ({
  isOpen,
  onClose,
  hoverAnimation,
  data = [],
  userStats,
  categoryStats,
  setTournamentId,
  tournamentId,
  tournamentData,
  loginedUserProfile,
}) => {
  const { t } = useTranslation('TournamentSelectorDrawer')
  const [isLargerThan992px] = useMediaQuery('(min-width: 992px)')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const [category, setCategory] = useState(null)

  const openModal = title => {
    setModalTitle(title)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalTitle('')
  }

  const handleQuizReportOpen = () => {
    if (!loginedUserProfile) return
    setShowQuizSummary(true)
    onClose() // Close the drawer
    closeModal() // Close the tournament modal
  }

  const handleQuizReportClose = () => {
    setShowQuizSummary(false)
  }

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement={isLargerThan992px ? 'left' : 'top'}
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent
          bg="rgba(15, 13, 21, 0.8)"
          borderRadius="xl"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          border="1px solid rgba(255, 255, 255, 0.18)"
          width={{ base: '100vw !important', lg: '15rem !important' }}
        >
          <DrawerCloseButton color="white" />
          <DrawerHeader
            textColor={'white'}
            textAlign={'center'}
            mt={{ base: '0', lg: '2rem' }}
          >
            {t('tournamentSelectorHeader')}
          </DrawerHeader>

          <DrawerBody>
            <Suspense fallback={<Spinner />}>
              <ButtonGradient />
            </Suspense>
            <Flex
              w={'100%'}
              justifyContent={'center'}
              alignItems={'center'}
              flexDirection={!isLargerThan992px ? 'row' : 'column'}
              gap={4}
            >
              {data.map((tournament, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    openModal(
                      `#${tournamentData[index].tournament.tournamentNumber
                        .toString()
                        .padStart(3, '0')}`,
                    )
                    setTournamentId(tournament?._id)
                  }}
                  hoverAnimation={hoverAnimation}
                >
                  {t('tournamentNumber', {
                    number: tournamentData[index].tournament.tournamentNumber
                      .toString()
                      .padStart(3, '0'),
                  })}
                </Button>
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <TournamentModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        userStats={userStats}
        categoryStats={categoryStats}
        setCategory={setCategory}
        setShowQuizSummary={handleQuizReportOpen}
        tournamentData={tournamentData}
      />

      {showQuizSummary && (
        <Suspense fallback={null}>
          <QuizReport
            isOpen={showQuizSummary}
            onClose={handleQuizReportClose}
            isTournament={true}
            tournamentId={tournamentId}
            category={category}
          />
        </Suspense>
      )}
    </>
  )
}

export default TournamentSelectorDrawer

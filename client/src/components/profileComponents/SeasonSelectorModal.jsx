import React, { useState, useCallback, useMemo, Suspense } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  useDisclosure,
  useMediaQuery,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

// Lazy load components
const Button = React.lazy(() => import('../miscellaneous/ButtonComponent'))
const ButtonGradient = React.lazy(() =>
  import('../../assets/svg/ButtonGradient'),
)
const SeasonModal = React.lazy(() => import('./SeasonModal'))

const SeasonSelectorModal = ({
  isOpen,
  onClose,
  currSeason,
  loginedUserProfile,
  inGameName,
  seasons,
}) => {
  const { t } = useTranslation('SeasonSelectorModal') // Add translation hook and namespace
  const {
    onOpen: onOpenSeasonModal,
    onClose: onCloseSeasonModal,
    isOpen: isOpenSeasonModal,
  } = useDisclosure()
  const [selectedSeason, setSelectedSeason] = useState(null)
  const [isLargerThan992px] = useMediaQuery('(min-width: 992px)')
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  const fetchSeasonHistory = useCallback(
    async season => {
      setIsLoading(true)
      try {
        const response = await axios.get(
          `/api/user/seasonHistory/${inGameName}?season=${season}`,
        )
        setProfile(response.data)
      } catch (error) {
        onCloseSeasonModal()
        setSelectedSeason(null)
        toast({
          title: t('errorTitle'), // Use translation key
          description: t('errorDescription'), // Use translation key
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [inGameName, onCloseSeasonModal, toast, t],
  )

  const handleSeasonClick = useCallback(
    season => {
      if (selectedSeason === season) {
        onCloseSeasonModal()
        setSelectedSeason(null)
      } else {
        ;(seasons.includes(season) || season === currSeason) &&
          fetchSeasonHistory(season)
        setSelectedSeason(season)
        onOpenSeasonModal()
      }
    },
    [
      selectedSeason,
      seasons,
      currSeason,
      fetchSeasonHistory,
      onOpenSeasonModal,
      onCloseSeasonModal,
    ],
  )

  const seasonButtons = useMemo(() => {
    return Array.from({ length: currSeason }, (_, i) => (
      <Suspense fallback={<Spinner />} key={i}>
        <Button
          white={selectedSeason === i + 1}
          onClick={() => handleSeasonClick(i + 1)}
        >
          {t('season')} {i + 1} {/* Use translation key */}
        </Button>
      </Suspense>
    ))
  }, [currSeason, handleSeasonClick, selectedSeason, t])

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement={isLargerThan992px ? 'left' : 'top'}
        onClose={() => {
          onCloseSeasonModal()
          onClose()
        }}
      >
        <DrawerOverlay />
        <DrawerContent
          bg="rgba(15, 13, 21, 0.8)"
          borderRadius="xl"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          border="1px solid rgba(255, 255, 255, 0.18)"
          width={{ base: '100vw !important', lg: '15rem !important' }}
        >
          <DrawerCloseButton color={'white'} />
          <DrawerHeader textAlign={'center'} mt={{ base: '0', lg: '2rem' }}>
            {t('selectSeason')} {/* Use translation key */}
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
              {seasonButtons}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Suspense fallback={<Spinner />}>
        <SeasonModal
          notInTheSeason={
            !seasons.includes(selectedSeason) && selectedSeason !== currSeason
          }
          isOpen={isOpenSeasonModal}
          onClose={() => {
            onCloseSeasonModal()
            setSelectedSeason(null)
          }}
          season={selectedSeason}
          isLoading={isLoading}
          profile={profile}
          privacyProfileData={false}
          loginedUserProfile={loginedUserProfile}
          inGameName={inGameName}
        />
      </Suspense>
    </>
  )
}

export default SeasonSelectorModal

import React, { useState, useMemo, useCallback, Suspense } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Flex,
  Box,
  Skeleton,
  SkeletonCircle,
  useDisclosure,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchResultItem from './userSearchDrawerComponents/SearchResultItem'
import NewChallengeModal from '../quickClashComponents/modals/NewChallengeModal'

// Lazy load the SearchBar component
const SearchBar = React.lazy(() => import('../leaderBoardComponents/SearchBar'))

const UserSearchDrawer = ({ isOpen, onClose, onSearchClick }) => {
  const { t } = useTranslation('UserSearchDrawer')
  const { t: tQuickClash } = useTranslation('QuickClash')
  const { t: TournamentBadgeTranslate } = useTranslation('TournamentBadge')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoad, setSearchLoad] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const navigate = useNavigate()
  const {
    isOpen: isChallengeModalOpen,
    onOpen: onChallengeModalOpen,
    onClose: onChallengeModalClose,
  } = useDisclosure()

  const bg = 'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)'
  const hoverBg = 'linear-gradient(135deg, #2a1d47, #1e1537)'
  const textColor = 'white'
  const subTextColor = 'gray.300'
  const badgeBg = 'blue.500'

  const handleClose = useCallback(() => {
    setSearchResults([])
    setSearchLoad(false)
    onClose()
  }, [onClose])

  const handleItemClick = useCallback(
    inGameName => {
      navigate(`/profile/${inGameName}`)
      handleClose()
      onSearchClick && onSearchClick()
    },
    [navigate, handleClose, onSearchClick],
  )

  const handleChallengeClick = useCallback(
    user => {
      setSelectedUser(user)
      onChallengeModalOpen()
    },
    [onChallengeModalOpen],
  )

  const StylishDivider = useMemo(
    () => (
      <Flex align="center" my={4}>
        <Box
          flex={1}
          height="1px"
          bgGradient="linear(to-r, gray.600, purple.500, blue.500, gray.600)"
        />
        <Box
          width="8px"
          height="8px"
          borderRadius="full"
          bgGradient="linear(45deg, #ff00cc, #3333cc)"
          mx={2}
          boxShadow="0 0 10px #ff00cc"
        />
        <Box
          flex={1}
          height="1px"
          bgGradient="linear(to-r, gray.600, purple.500, blue.500, gray.600)"
        />
      </Flex>
    ),
    [],
  )

  const SkeletonLoader = useMemo(
    () => (
      <VStack spacing={4} align="stretch" mt={4}>
        {[...Array(10)]?.map((_, index) => (
          <Flex key={index} alignItems="center" p={3}>
            <SkeletonCircle size="10" />
            <Box ml={4} flex={1}>
              <Skeleton height="20px" width="80%" mb={2} />
              <Skeleton height="16px" width="60%" />
            </Box>
            <Skeleton height="24px" width="40px" />
          </Flex>
        ))}
      </VStack>
    ),
    [],
  )

  const renderSearchResults = useMemo(
    () =>
      searchResults.map((user, index) => (
        <React.Fragment key={user.inGameName}>
          {index > 0 && StylishDivider}
          <SearchResultItem
            user={user}
            onItemClick={handleItemClick}
            onChallengeClick={handleChallengeClick}
            hoverBg={hoverBg}
            textColor={textColor}
            subTextColor={subTextColor}
            badgeBg={badgeBg}
            TournamentBadgeTranslate={TournamentBadgeTranslate}
          />
        </React.Fragment>
      )),
    [
      searchResults,
      StylishDivider,
      handleItemClick,
      handleChallengeClick,
      hoverBg,
      textColor,
      subTextColor,
      badgeBg,
      TournamentBadgeTranslate,
    ],
  )

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={handleClose}
        size={{ base: 'full', md: 'sm' }}
      >
        <DrawerOverlay />
        <DrawerContent bgColor="#0f0d15" bgImage={bg}>
          <DrawerCloseButton color={textColor} />
          <DrawerHeader color={textColor}>
            {t('UserSearchDrawer.searchUsers')}
          </DrawerHeader>

          <DrawerBody>
            <Suspense fallback={SkeletonLoader}>
              <SearchBar
                w="100%"
                setSearchResults={setSearchResults}
                setSearchLoad={setSearchLoad}
              />
            </Suspense>
            {searchLoad ? (
              SkeletonLoader
            ) : (
              <VStack spacing={0} align="stretch" mt={4}>
                {renderSearchResults}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <NewChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={onChallengeModalClose}
        preSelectedUser={selectedUser}
      />
    </>
  )
}

export default React.memo(UserSearchDrawer)

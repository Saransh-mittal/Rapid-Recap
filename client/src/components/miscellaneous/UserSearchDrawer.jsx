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
  Avatar,
  Text,
  Box,
  useToast,
  Skeleton,
  SkeletonCircle,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiZap } from 'react-icons/fi'
import axios from 'axios'
import SearchResultItem from './userSearchDrawerComponents/SearchResultItem'

// Lazy load the SearchBar component
const SearchBar = React.lazy(() => import('../leaderBoardComponents/SearchBar'))

const ChallengeModal = ({
  isOpen,
  onClose,
  selectedUser,
  categories,
  onSendChallenge,
  isLoading,
}) => {
  const { t } = useTranslation('QuickClash')
  const [selectedCategories, setSelectedCategories] = useState([])

  const handleCategoryChange = e => {
    const options = e.target.options
    const selected = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value)
      }
    }
    setSelectedCategories(selected)
  }

  const handleSendChallenge = () => {
    if (selectedCategories.length === 0) {
      return
    }
    onSendChallenge(selectedUser, selectedCategories)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent
        bg="linear-gradient(135deg, #1a1527, #0f0d15)"
        borderRadius="xl"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
      >
        <ModalHeader color="white">
          {t('Challenge')} {selectedUser?.name}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <Flex direction="column" gap={4}>
            <Flex align="center" gap={3}>
              <Avatar src={selectedUser?.pic} name={selectedUser?.name} />
              <Box>
                <Text color="white" fontWeight="bold">
                  {selectedUser?.name}
                </Text>
                <Text color="gray.300">@{selectedUser?.inGameName}</Text>
              </Box>
            </Flex>

            <Text color="white">
              {t('Select categories for your challenge:')}
            </Text>
            <Select
              multiple
              size="md"
              onChange={handleCategoryChange}
              bg="whiteAlpha.200"
              color="white"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: 'purple.400' }}
              _focus={{
                borderColor: 'purple.500',
                boxShadow: '0 0 0 1px #805AD5',
              }}
              height="120px"
            >
              {categories.map(category => (
                <option
                  key={category.key}
                  value={category.key}
                  style={{ background: '#1a1527' }}
                >
                  {category.label}
                </option>
              ))}
            </Select>
            <Text color="gray.300" fontSize="sm">
              {t('Hold Ctrl/Cmd to select multiple categories (min 1, max 3)')}
            </Text>
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" colorScheme="gray" mr={3} onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            colorScheme="purple"
            leftIcon={<FiZap />}
            onClick={handleSendChallenge}
            isLoading={isLoading}
            isDisabled={
              selectedCategories.length === 0 || selectedCategories.length > 3
            }
            bgGradient="linear(to-r, purple.500, purple.700)"
            _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
          >
            {t('Send Challenge')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const UserSearchDrawer = ({ isOpen, onClose, onSearchClick }) => {
  const { t } = useTranslation('UserSearchDrawer')
  const { t: tQuickClash } = useTranslation('QuickClash')
  const { t: TournamentBadgeTranslate } = useTranslation('TournamentBadge')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoad, setSearchLoad] = useState(false)
  const [isChallengeSending, setIsChallengeSending] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const toast = useToast()
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

  // Available categories for quick clash
  const categories = useMemo(
    () => [
      { key: 'world', label: tQuickClash('World') },
      { key: 'politics', label: tQuickClash('Politics') },
      { key: 'business', label: tQuickClash('Business') },
      { key: 'technology', label: tQuickClash('Technology') },
      { key: 'sports', label: tQuickClash('Sports') },
      { key: 'health', label: tQuickClash('Health') },
      { key: 'science', label: tQuickClash('Science') },
      { key: 'environment', label: tQuickClash('Environment') },
    ],
    [tQuickClash],
  )

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

  const sendChallenge = useCallback(
    async (user, selectedCategories) => {
      if (!user || selectedCategories.length === 0) return

      setIsChallengeSending(true)
      try {
        const response = await axios.post('/api/quickClash/challenge/create', {
          opponentId: user._id,
          categories: selectedCategories,
        })

        toast({
          title: tQuickClash('Challenge Sent!'),
          description:
            tQuickClash('Your challenge has been sent to') + ` ${user.name}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })

        onChallengeModalClose()
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || tQuickClash('Error sending challenge')
        toast({
          title: tQuickClash('Challenge Failed'),
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setIsChallengeSending(false)
      }
    },
    [toast, tQuickClash, onChallengeModalClose],
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

      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={onChallengeModalClose}
        selectedUser={selectedUser}
        categories={categories}
        onSendChallenge={sendChallenge}
        isLoading={isChallengeSending}
      />
    </>
  )
}

export default React.memo(UserSearchDrawer)

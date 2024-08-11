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
  Badge,
  Box,
  useToast,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

// Lazy load the SearchBar component
const SearchBar = React.lazy(() => import('../leaderBoardComponents/SearchBar'))

const UserSearchDrawer = ({ isOpen, onClose, onSearchClick }) => {
  const [searchResults, setSearchResults] = useState([])
  const [searchLoad, setSearchLoad] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

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
        {[...Array(10)].map((_, index) => (
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
          <Flex
            alignItems="center"
            p={3}
            borderRadius="lg"
            transition="all 0.3s"
            cursor="pointer"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgImage: hoverBg,
              opacity: 0,
              transition: 'opacity 0.3s ease',
            }}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(138, 43, 226, 0.2)',
              _before: {
                opacity: 1,
              },
            }}
            onClick={() => {
              navigate(`/profile/${user.inGameName}`)
              handleClose()
              onSearchClick && onSearchClick()
            }}
          >
            <Avatar name={user.name} src={user.pic} size="md" zIndex={1} />
            <Box ml={4} flex={1} zIndex={1}>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color={textColor}
                mb="2px"
              >
                {user.name}
              </Text>
              <Text fontSize="xs" color={subTextColor} mb={0}>
                @{user.inGameName}
              </Text>
            </Box>
            <Badge
              bg={badgeBg}
              color="white"
              borderRadius="full"
              px={2}
              py={1}
              fontWeight="bold"
              fontSize="xs"
              boxShadow="0 2px 4px rgba(0,0,0,0.2)"
              display="flex"
              alignItems="center"
              zIndex={1}
            >
              <Text as="span" role="img" aria-label="brain" mr={1}>
                🧠
              </Text>
              {user.IQ_score}
            </Badge>
          </Flex>
        </React.Fragment>
      )),
    [
      searchResults,
      StylishDivider,
      hoverBg,
      navigate,
      handleClose,
      onSearchClick,
      textColor,
      subTextColor,
      badgeBg,
    ],
  )

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={handleClose}
      size={{ base: 'full', md: 'xs' }}
    >
      <DrawerOverlay />
      <DrawerContent bgColor="#0f0d15" bgImage={bg}>
        <DrawerCloseButton color={textColor} />
        <DrawerHeader color={textColor}>Search Users</DrawerHeader>

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
  )
}

export default React.memo(UserSearchDrawer)

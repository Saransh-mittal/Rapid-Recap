// components/quickClashComponents/matchmaking/UserCard.jsx
import React, { useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Icon,
  Button,
  Flex,
  Tag,
  TagLabel,
  useToast,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Target, Zap, Clock, Check, Shield, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * UserCard component for displaying users in matchmaking
 * @param {Object} props - Component props
 * @param {Object} props.user - User data
 * @param {boolean} props.isSelected - Whether user is selected
 * @param {boolean} props.isPending - Whether there's a pending challenge
 * @param {boolean} props.isLoading - Whether challenge creation is loading
 * @param {Function} props.onSelect - Selection handler
 */
const UserCard = ({
  user,
  isSelected = false,
  isPending = false,
  isLoading = false,
  onSelect,
}) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // Responsive sizes
  const avatarSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const padding = useBreakpointValue({ base: 3, md: 4 })
  const fontSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const tagSize = useBreakpointValue({ base: 'sm', md: 'sm' })
  const badgePosition = useBreakpointValue({ base: 2, md: 3 })

  // Handle click on card
  const handleClick = useCallback(() => {
    if (!isPending && !isLoading) {
      onSelect(user)
    }
  }, [user, isPending, isLoading, onSelect])

  // Get display name (prioritize in-game name)
  const displayName = user.user.inGameName || user.user.name

  return (
    <MotionBox
      borderWidth="1px"
      borderColor={isSelected ? 'purple.400' : 'rgba(255, 255, 255, 0.08)'}
      borderRadius="xl"
      overflow="hidden"
      bg={isSelected ? 'rgba(128, 90, 213, 0.2)' : 'rgba(26, 32, 44, 0.4)'}
      boxShadow={
        isSelected
          ? '0 0 20px rgba(128, 90, 213, 0.5)'
          : '0 8px 20px -8px rgba(0, 0, 0, 0.3)'
      }
      cursor={isPending || isLoading ? 'default' : 'pointer'}
      transition="all 0.3s ease"
      onClick={handleClick}
      position="relative"
      backdropFilter="blur(8px)"
      h="100%"
      _active={{
        transform: isPending || isLoading ? 'none' : 'scale(0.98)',
      }}
    >
      {/* Status indicators */}
      {isPending && (
        <Badge
          position="absolute"
          top={badgePosition}
          right={badgePosition}
          colorScheme="yellow"
          px={2}
          py={1}
          fontSize="xs"
          borderRadius="full"
          display="flex"
          alignItems="center"
          boxShadow="0 2px 10px rgba(236, 201, 75, 0.4)"
          zIndex={2}
        >
          <Icon as={Clock} mr={1} boxSize={3} />
          {t('Pending')}
        </Badge>
      )}

      {/* Card glow effect */}
      <Box
        position="absolute"
        top="-50%"
        left="-20%"
        width="140%"
        height="100%"
        bg={isSelected ? 'purple.700' : 'blue.900'}
        opacity={isSelected ? '0.2' : '0.1'}
        filter="blur(40px)"
        borderRadius="full"
        zIndex={0}
      />

      {/* Card content */}
      <Box p={padding} position="relative" zIndex={1}>
        <VStack spacing={{ base: 3, md: 4 }} align="center">
          {/* Avatar with subtle glow effect */}
          <Box position="relative" borderRadius="full" p={1}>
            <MotionBox
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              borderRadius="full"
              bg={isSelected ? 'purple.500' : 'transparent'}
              opacity={0.5}
              filter="blur(10px)"
              animate={
                isSelected
                  ? {
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
            <Avatar
              size={avatarSize}
              name={user.user.name}
              src={user.user.pic}
              bg="purple.500"
              border="3px solid"
              borderColor={isSelected ? 'purple.400' : 'whiteAlpha.300'}
            />
          </Box>

          {/* Name */}
          <Text
            fontWeight="bold"
            color="white"
            fontSize={fontSize}
            noOfLines={1}
            textAlign="center"
            width="100%"
            px={1}
          >
            {displayName}
          </Text>

          {/* Preferred categories */}
          {user.preferredCategories && user.preferredCategories.length > 0 && (
            <Flex wrap="wrap" justify="center" gap={1} mb={1}>
              {user.preferredCategories.map(category => (
                <Tag
                  key={category}
                  size={tagSize}
                  colorScheme="purple"
                  variant="subtle"
                  borderRadius="full"
                  boxShadow="0 0 10px rgba(128, 90, 213, 0.2)"
                >
                  <TagLabel fontSize="xs" isTruncated maxWidth="80px">
                    {category}
                  </TagLabel>
                </Tag>
              ))}
            </Flex>
          )}

          {/* Challenge button */}
          <Box width="100%">
            <MotionButton
              colorScheme="purple"
              size={buttonSize}
              width="full"
              leftIcon={<Check size={16} />}
              isLoading={isLoading}
              loadingText={useBreakpointValue({
                base: '',
                sm: t('Accepting'),
              })}
              isDisabled={isPending || isLoading}
              onClick={e => {
                e.stopPropagation()
                handleClick()
              }}
              borderRadius="lg"
              _hover={{
                bg: 'purple.500',
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(128, 90, 213, 0.4)',
              }}
              _active={{
                bg: 'purple.600',
                transform: 'translateY(0)',
              }}
              transition="all 0.3s ease"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              py={{ base: 1, md: 2 }}
              aria-label={t('Accept Challenge')}
            >
              {t('Accept Challenge')}
            </MotionButton>
          </Box>
        </VStack>
      </Box>
    </MotionBox>
  )
}

export default UserCard

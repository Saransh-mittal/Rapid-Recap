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
  TagLeftIcon,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Target, Zap, Clock, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

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
      borderColor={isSelected ? 'purple.500' : 'whiteAlpha.200'}
      borderRadius="lg"
      overflow="hidden"
      bg={isSelected ? 'rgba(128, 90, 213, 0.2)' : 'whiteAlpha.100'}
      boxShadow={isSelected ? '0 0 0 2px #805AD5' : 'none'}
      cursor={isPending || isLoading ? 'default' : 'pointer'}
      transition="all 0.2s"
      _hover={{
        bg: isPending || isLoading ? 'whiteAlpha.100' : 'whiteAlpha.200',
        transform: isPending || isLoading ? 'none' : 'translateY(-2px)',
        boxShadow: isPending || isLoading ? 'none' : 'lg',
      }}
      onClick={handleClick}
      position="relative"
      whileHover={isPending || isLoading ? {} : { scale: 1.02 }}
      whileTap={isPending || isLoading ? {} : { scale: 0.98 }}
    >
      {/* Status indicators - No more bot indicator */}
      {isPending && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="yellow"
          px={2}
          py={1}
          display="flex"
          alignItems="center"
        >
          <Icon as={Clock} mr={1} boxSize={3} />
          {t('Pending')}
        </Badge>
      )}

      <Box p={4}>
        <VStack spacing={3} align="center">
          <Avatar
            size="lg"
            name={user.user.name}
            src={user.user.pic}
            bg="purple.500"
          />

          <Text
            fontWeight="bold"
            color="white"
            fontSize="md"
            noOfLines={1}
            textAlign="center"
          >
            {displayName}
          </Text>

          {/* Preferred categories */}
          {user.preferredCategories && user.preferredCategories.length > 0 && (
            <Flex wrap="wrap" justify="center" gap={1}>
              {user.preferredCategories.map(category => (
                <Tag
                  key={category}
                  size="sm"
                  colorScheme="purple"
                  variant="subtle"
                >
                  <TagLabel fontSize="xs">{category}</TagLabel>
                </Tag>
              ))}
            </Flex>
          )}

          {/* Challenge button */}
          <Button
            colorScheme="purple"
            size="sm"
            width="100%"
            leftIcon={<Check size={16} />} // Changed from Target to Check icon
            isLoading={isLoading}
            loadingText={t('Accepting')} // Changed from 'Challenging'
            isDisabled={isPending || isLoading}
            onClick={e => {
              e.stopPropagation()
              handleClick()
            }}
          >
            {t('Accept Challenge')}
          </Button>
        </VStack>
      </Box>
    </MotionBox>
  )
}

export default UserCard

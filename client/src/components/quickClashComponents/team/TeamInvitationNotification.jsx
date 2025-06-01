// components/quickClashComponents/team/TeamInvitationNotification.jsx
import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Check, X, Clock } from 'lucide-react'
import axios from 'axios'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Component to display and handle team invitation notifications
 */
const TeamInvitationNotification = ({
  notification,
  onInvitationHandled,
  onClose,
}) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [actionType, setActionType] = useState(null) // 'accept' or 'reject'

  const { invitationData } = notification
  const isPending = invitationData?.status === 'pending'
  const isAccepted = invitationData?.status === 'accepted'
  const isRejected = invitationData?.status === 'rejected'

  // Handle accepting the invitation
  const handleAcceptInvitation = async () => {
    setLoading(true)
    setActionType('accept')

    try {
      const response = await axios.post(
        `/api/quickClash/team/invitation/${notification._id}/accept`,
      )

      toast({
        title: t('Invitation Accepted'),
        description: t('You have successfully joined the team!'),
        status: 'success',
        duration: 4000,
        isClosable: true,
      })

      // Call the callback to refresh notifications and close modal
      if (onInvitationHandled) {
        onInvitationHandled('accepted', response.data.team)
      }

      // Close the modal after a short delay
      setTimeout(() => {
        if (onClose) onClose()
      }, 1500)
    } catch (error) {
      toast({
        title: t('Error'),
        description:
          error.response?.data?.message || t('Failed to accept invitation'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
      setActionType(null)
    }
  }

  // Handle rejecting the invitation
  const handleRejectInvitation = async () => {
    setLoading(true)
    setActionType('reject')

    try {
      await axios.post(
        `/api/quickClash/team/invitation/${notification._id}/reject`,
      )

      toast({
        title: t('Invitation Rejected'),
        description: t('You have declined the team invitation'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      })

      // Call the callback to refresh notifications
      if (onInvitationHandled) {
        onInvitationHandled('rejected')
      }

      // Close the modal after a short delay
      setTimeout(() => {
        if (onClose) onClose()
      }, 1500)
    } catch (error) {
      toast({
        title: t('Error'),
        description:
          error.response?.data?.message || t('Failed to reject invitation'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
      setActionType(null)
    }
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: loading ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: 0.3,
        scale: {
          duration: loading ? 2 : 0.3,
          repeat: loading ? Infinity : 0,
          repeatType: 'reverse',
          ease: 'easeInOut',
        },
      }}
      bg="rgba(23, 25, 35, 0.8)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor={
        loading
          ? actionType === 'accept'
            ? 'green.500'
            : 'red.500'
          : 'purple.500'
      }
      p={6}
      backdropFilter="blur(10px)"
      boxShadow={
        loading
          ? `0 0 30px ${
              actionType === 'accept'
                ? 'rgba(72, 187, 120, 0.4)'
                : 'rgba(245, 101, 101, 0.4)'
            }`
          : '0 4px 20px rgba(0, 0, 0, 0.3)'
      }
      position="relative"
      overflow="hidden"
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Box
              p={2}
              bg="purple.500"
              borderRadius="lg"
              boxShadow="0 0 10px rgba(128, 90, 213, 0.4)"
            >
              <Icon as={Users} color="white" boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {t('Team Invitation')}
              </Text>
              <Text fontSize="sm" color="whiteAlpha.700">
                {formatDate(notification.date)}
              </Text>
            </VStack>
          </HStack>

          {/* Status Badge */}
          <Badge
            colorScheme={isPending ? 'yellow' : isAccepted ? 'green' : 'red'}
            variant="solid"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
          >
            <HStack spacing={1}>
              <Icon
                as={isPending ? Clock : isAccepted ? Check : X}
                boxSize={3}
              />
              <Text>
                {isPending
                  ? t('Pending')
                  : isAccepted
                  ? t('Accepted')
                  : t('Rejected')}
              </Text>
            </HStack>
          </Badge>
        </HStack>

        <Divider borderColor="whiteAlpha.200" />

        {/* Invitation Details */}
        <VStack spacing={3} align="stretch">
          <Box
            bg="whiteAlpha.50"
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
          >
            <VStack spacing={2} align="start">
              <Text color="white" fontSize="md">
                <Text as="span" fontWeight="bold" color="purple.300">
                  {invitationData?.inviterName}
                </Text>{' '}
                {t('has invited you to join their team')}
              </Text>

              <HStack spacing={2}>
                <Text fontSize="sm" color="whiteAlpha.700">
                  {t('Team Name')}:
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="cyan.300">
                  {invitationData?.teamName}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Additional message */}
          <Text fontSize="sm" color="whiteAlpha.800" textAlign="center">
            {notification.mainText}
          </Text>
        </VStack>

        {/* Action Buttons - Only show if pending */}
        {isPending && (
          <>
            <Divider borderColor="whiteAlpha.200" />

            <VStack spacing={3}>
              {/* Loading overlay when any action is in progress */}
              {loading && (
                <MotionBox
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  bg="rgba(0, 0, 0, 0.6)"
                  borderRadius="md"
                  p={3}
                  width="100%"
                  textAlign="center"
                  backdropFilter="blur(4px)"
                >
                  <HStack justify="center" spacing={3}>
                    <Spinner
                      size="sm"
                      color={actionType === 'accept' ? 'green.400' : 'red.400'}
                      thickness="3px"
                    />
                    <Text fontSize="sm" color="white" fontWeight="medium">
                      {actionType === 'accept'
                        ? t('Processing your acceptance...')
                        : t('Processing your rejection...')}
                    </Text>
                  </HStack>
                </MotionBox>
              )}

              <HStack spacing={3} justify="center" width="100%">
                <MotionButton
                  leftIcon={
                    loading && actionType === 'accept' ? undefined : (
                      <Check size={18} />
                    )
                  }
                  colorScheme="green"
                  size="md"
                  onClick={handleAcceptInvitation}
                  isLoading={loading && actionType === 'accept'}
                  loadingText=""
                  spinner={
                    <HStack spacing={2}>
                      <Spinner size="sm" color="white" thickness="3px" />
                      <Text fontSize="sm">{t('Accepting...')}</Text>
                    </HStack>
                  }
                  isDisabled={loading}
                  whileHover={!loading ? { scale: 1.05 } : {}}
                  whileTap={!loading ? { scale: 0.95 } : {}}
                  flex={1}
                  bg="green.600"
                  _hover={{ bg: loading ? 'green.600' : 'green.700' }}
                  _disabled={{
                    opacity: loading && actionType !== 'accept' ? 0.4 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  boxShadow={
                    loading && actionType === 'accept'
                      ? '0 0 20px rgba(72, 187, 120, 0.6)'
                      : '0 4px 10px rgba(0,0,0,0.3)'
                  }
                  transition="all 0.3s ease"
                >
                  {loading && actionType === 'accept' ? '' : t('Accept')}
                </MotionButton>

                <MotionButton
                  leftIcon={
                    loading && actionType === 'reject' ? undefined : (
                      <X size={18} />
                    )
                  }
                  colorScheme="red"
                  variant="outline"
                  size="md"
                  onClick={handleRejectInvitation}
                  isLoading={loading && actionType === 'reject'}
                  loadingText=""
                  spinner={
                    <HStack spacing={2}>
                      <Spinner size="sm" color="red.400" thickness="3px" />
                      <Text fontSize="sm">{t('Rejecting...')}</Text>
                    </HStack>
                  }
                  isDisabled={loading}
                  whileHover={!loading ? { scale: 1.05 } : {}}
                  whileTap={!loading ? { scale: 0.95 } : {}}
                  flex={1}
                  borderColor="red.500"
                  color="red.300"
                  _hover={{
                    bg: loading ? 'transparent' : 'red.600',
                    color: loading ? 'red.300' : 'white',
                    borderColor: loading ? 'red.500' : 'red.600',
                  }}
                  _disabled={{
                    opacity: loading && actionType !== 'reject' ? 0.4 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  boxShadow={
                    loading && actionType === 'reject'
                      ? '0 0 20px rgba(245, 101, 101, 0.6)'
                      : 'none'
                  }
                  transition="all 0.3s ease"
                >
                  {loading && actionType === 'reject' ? '' : t('Decline')}
                </MotionButton>
              </HStack>

              {/* Helpful text during loading */}
              {loading && (
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Text fontSize="xs" color="whiteAlpha.600" textAlign="center">
                    {actionType === 'accept'
                      ? t('Adding you to the team...')
                      : t('Declining the invitation...')}
                  </Text>
                </MotionBox>
              )}
            </VStack>
          </>
        )}

        {/* Status Messages for non-pending invitations */}
        {!isPending && (
          <Alert
            status={isAccepted ? 'success' : 'warning'}
            bg={isAccepted ? 'green.900' : 'red.900'}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={isAccepted ? 'green.500' : 'red.500'}
          >
            <AlertIcon color={isAccepted ? 'green.300' : 'red.300'} />
            <AlertDescription color="white">
              {isAccepted
                ? t('You have joined this team successfully!')
                : t('You have declined this team invitation.')}
            </AlertDescription>
          </Alert>
        )}
      </VStack>

      {/* Loading overlay for the entire component */}
      {loading && (
        <MotionBox
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.1)"
          borderRadius="xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          pointerEvents="none"
        />
      )}
    </MotionBox>
  )
}

export default TeamInvitationNotification

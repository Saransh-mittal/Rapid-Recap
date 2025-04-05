// components/quickClashComponents/team/CategoryCard.jsx
import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FileText, Play } from 'lucide-react'

const MotionBox = motion(Box)

/**
 * Component to display a category card in the team battle
 */
const CategoryCard = ({
  challenge,
  isAvailable,
  isCompleted,
  isSelectedByTeammate,
  isUserAssigned,
  userScore,
  opponentScore,
  opponentCompleted,
  onSelect,
  onViewReport,
  reportModalLoading,
  categorySelectionLoading,
  selectedCategoryId,
}) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()

  return (
    <MotionBox
      bg={
        isAvailable
          ? 'rgba(72, 187, 120, 0.1)'
          : isCompleted
          ? 'rgba(128, 90, 213, 0.1)'
          : isSelectedByTeammate
          ? 'rgba(237, 137, 54, 0.1)'
          : 'rgba(160, 174, 192, 0.1)'
      }
      borderWidth="1px"
      borderColor={
        isAvailable
          ? 'green.500'
          : isCompleted
          ? 'purple.500'
          : isSelectedByTeammate
          ? 'orange.500'
          : 'gray.500'
      }
      borderRadius="lg"
      p={4}
      position="relative"
      overflow="hidden"
      whileHover={
        isAvailable
          ? { y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }
          : {}
      }
      transition={{ duration: 0.3 }}
      cursor={isAvailable ? 'pointer' : 'default'}
      onClick={() => isAvailable && onSelect(challenge.category)}
      _before={
        isAvailable
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              bgGradient: 'linear(to-r, green.400, teal.300)',
            }
          : {}
      }
    >
      <VStack spacing={3} align="stretch">
        <Badge
          colorScheme={
            isAvailable
              ? 'green'
              : isCompleted
              ? 'purple'
              : isSelectedByTeammate
              ? 'orange'
              : 'gray'
          }
          alignSelf="flex-start"
          borderRadius="full"
          px={2}
        >
          {challenge.category}
        </Badge>

        {/* Status */}
        {isCompleted ? (
          <HStack justify="space-between">
            <Badge colorScheme="green">{t('Completed')}</Badge>
            <Badge colorScheme="purple">
              {userScore} {t('pts')}
            </Badge>
          </HStack>
        ) : isUserAssigned && !isCompleted ? (
          <HStack justify="space-between">
            <Badge colorScheme="yellow">{t('In Progress')}</Badge>
            <Badge colorScheme="blue" variant="outline">
              {t('Continue')}
            </Badge>
          </HStack>
        ) : isSelectedByTeammate ? (
          <HStack justify="space-between">
            <Badge colorScheme="orange">{t('Selected by Teammate')}</Badge>
          </HStack>
        ) : isAvailable ? (
          <HStack justify="space-between">
            <Badge colorScheme="green">{t('Available')}</Badge>
            <Badge colorScheme="blue" variant="outline">
              {t('Start')}
            </Badge>
          </HStack>
        ) : (
          <HStack justify="space-between">
            <Badge colorScheme="gray">{t('Unavailable')}</Badge>
          </HStack>
        )}

        {/* Results if both completed */}
        {isCompleted && opponentCompleted && (
          <HStack justify="space-between" pt={1}>
            <Text fontSize="sm" color="whiteAlpha.700">
              {t('Result')}:
            </Text>
            {userScore > opponentScore ? (
              <Badge colorScheme="green">{t('Won')}</Badge>
            ) : userScore < opponentScore ? (
              <Badge colorScheme="red">{t('Lost')}</Badge>
            ) : (
              <Badge colorScheme="yellow">{t('Tie')}</Badge>
            )}
          </HStack>
        )}

        {/* Button for actions */}
        {isCompleted ? (
          <Button
            size="sm"
            colorScheme="purple"
            leftIcon={<Icon as={FileText} size={16} />}
            mt={2}
            onClick={() => onViewReport(challenge.challenge?._id)}
            isLoading={reportModalLoading}
          >
            {t('View Report')}
          </Button>
        ) : isUserAssigned && !isCompleted ? (
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<Icon as={Play} size={16} />}
            mt={2}
            onClick={() =>
              navigate(`/quickclash/session/${challenge.challenge?._id}`)
            }
          >
            {t('Continue Challenge')}
          </Button>
        ) : (
          isAvailable && (
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<Icon as={Play} size={16} />}
              mt={2}
              isLoading={
                categorySelectionLoading &&
                selectedCategoryId === challenge.challenge
              }
              loadingText={t('Starting...')}
            >
              {t('Start Challenge')}
            </Button>
          )
        )}
      </VStack>
    </MotionBox>
  )
}

export default CategoryCard

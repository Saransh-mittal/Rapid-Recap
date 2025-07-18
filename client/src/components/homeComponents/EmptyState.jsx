// client/src/components/homeComponents/EmptyState.jsx
import React from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Search,
  BookOpen,
  Coffee,
  RefreshCw,
  Globe,
  TrendingUp,
  Compass,
  Bookmark,
  Users,
  ArrowUpRight,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionVStack = motion(VStack)

const EmptyState = ({ category, onRefresh, isSearching = false }) => {
  const { t } = useTranslation('Home')
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector(state => state.auth)

  // Compact responsive values
  const iconSize = useBreakpointValue({ base: 5, md: 6 })
  const titleSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const descSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const containerWidth = useBreakpointValue({
    base: '95%',
    sm: '400px',
    md: '450px',
  })

  const getEmptyStateContent = () => {
    if (isSearching) {
      return {
        icon: Search,
        title: t('emptyState.search.title'),
        description: t('emptyState.search.description'),
        primaryAction: {
          text: t('emptyState.search.clearSearch'),
          action: () => window.location.reload(),
          icon: RefreshCw,
        },
        secondaryAction: {
          text: t('emptyState.search.browseAll'),
          action: () => navigate('/home/all'),
          icon: Globe,
        },
        accent: '#3B82F6',
        gradient: 'linear(135deg, #3B82F6, #1D4ED8)',
      }
    }

    switch (category?.toLowerCase()) {
      case 'all':
        return {
          icon: isAuthenticated ? Coffee : TrendingUp,
          title: isAuthenticated
            ? t('emptyState.all.authenticatedTitle')
            : t('emptyState.all.guestTitle'),
          description: isAuthenticated
            ? t('emptyState.all.authenticatedDescription')
            : t('emptyState.all.guestDescription'),
          primaryAction: {
            text: isAuthenticated
              ? t('emptyState.all.exploreCategories')
              : t('emptyState.all.browseTop'),
            action: () =>
              navigate(isAuthenticated ? '/home/general' : '/home/top'),
            icon: Compass,
          },
          secondaryAction: isAuthenticated
            ? {
                text: t('emptyState.all.refreshRecommendations'),
                action: onRefresh,
                icon: RefreshCw,
              }
            : {
                text: t('emptyState.all.signUp'),
                action: () => navigate('/#register'),
                icon: Users,
              },
          accent: '#8B5CF6',
          gradient: 'linear(135deg, #8B5CF6, #7C3AED)',
        }

      case 'top':
        return {
          icon: TrendingUp,
          title: t('emptyState.top.title'),
          description: t('emptyState.top.description'),
          primaryAction: {
            text: t('emptyState.top.exploreGeneral'),
            action: () => navigate('/home/general'),
            icon: BookOpen,
          },
          secondaryAction: {
            text: t('emptyState.top.refresh'),
            action: onRefresh,
            icon: RefreshCw,
          },
          accent: '#F59E0B',
          gradient: 'linear(135deg, #F59E0B, #D97706)',
        }

      default:
        return {
          icon: BookOpen,
          title: t('emptyState.category.title', { category }),
          description: t('emptyState.category.description', { category }),
          primaryAction: {
            text: t('emptyState.category.exploreAll'),
            action: () => navigate('/home/all'),
            icon: Globe,
          },
          secondaryAction: {
            text: t('emptyState.category.exploreGeneral'),
            action: () => navigate('/home/general'),
            icon: Bookmark,
          },
          accent: '#10B981',
          gradient: 'linear(135deg, #10B981, #059669)',
        }
    }
  }

  const content = getEmptyStateContent()

  return (
    <Flex
      justify="center"
      align="center"
      py={{ base: 8, md: 12 }}
      px={4}
      minH="300px"
      maxH="500px"
    >
      <MotionBox
        w={containerWidth}
        maxW="500px"
        bg="rgba(255,255,255,0.03)"
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor="rgba(255,255,255,0.08)"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        position="relative"
        overflow="hidden"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        boxShadow="0 8px 32px rgba(0,0,0,0.2)"
      >
        {/* Subtle background gradient */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          background="linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)"
          borderRadius="2xl"
        />

        <MotionVStack
          spacing={5}
          textAlign="center"
          position="relative"
          zIndex={1}
        >
          {/* Compact icon */}
          <MotionBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Flex
              w={{ base: 12, md: 14 }}
              h={{ base: 12, md: 14 }}
              align="center"
              justify="center"
              borderRadius="full"
              bg="rgba(255,255,255,0.06)"
              border="1px solid"
              borderColor="rgba(255,255,255,0.1)"
            >
              <Icon
                as={content.icon}
                w={iconSize}
                h={iconSize}
                color="white"
                opacity={0.9}
              />
            </Flex>
          </MotionBox>

          {/* Compact content */}
          <MotionVStack
            spacing={3}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Text
              fontSize={titleSize}
              fontWeight="600"
              lineHeight="1.2"
              color="white"
              textShadow="0 1px 8px rgba(0,0,0,0.3)"
            >
              {content.title}
            </Text>

            <Text
              fontSize={descSize}
              fontWeight="400"
              color="rgba(255,255,255,0.8)"
              lineHeight="1.5"
              textShadow="0 1px 4px rgba(0,0,0,0.2)"
              maxW="85%"
            >
              {content.description}
            </Text>
          </MotionVStack>

          {/* Compact buttons */}
          <MotionVStack
            spacing={4}
            w="100%"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Primary button - full width */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%' }}
            >
              <Button
                onClick={content.primaryAction.action}
                w="100%"
                h={{ base: '44px', md: '48px' }}
                size={buttonSize}
                bgGradient={content.gradient}
                color="white"
                fontWeight="600"
                fontSize={{ base: 'md', md: 'md' }}
                borderRadius="xl"
                _hover={{
                  bgGradient: content.gradient,
                  boxShadow: `0 6px 20px ${content.accent}40`,
                  transform: 'translateY(-1px)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
                rightIcon={<Icon as={ArrowUpRight} w={4} h={4} />}
                boxShadow={`0 4px 12px ${content.accent}25`}
              >
                {content.primaryAction.text}
              </Button>
            </motion.div>

            {/* Secondary button - full width */}
            {content.secondaryAction && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%' }}
              >
                <Button
                  onClick={content.secondaryAction.action}
                  w="100%"
                  h={{ base: '44px', md: '48px' }}
                  size={buttonSize}
                  bg="rgba(255,255,255,0.05)"
                  color="rgba(255,255,255,0.85)"
                  fontWeight="500"
                  fontSize={{ base: 'md', md: 'md' }}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="rgba(255,255,255,0.15)"
                  backdropFilter="blur(10px)"
                  _hover={{
                    bg: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    transform: 'translateY(-1px)',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s ease"
                  leftIcon={
                    <Icon as={content.secondaryAction.icon} w={4} h={4} />
                  }
                >
                  {content.secondaryAction.text}
                </Button>
              </motion.div>
            )}
          </MotionVStack>
        </MotionVStack>
      </MotionBox>
    </Flex>
  )
}

export default React.memo(EmptyState)

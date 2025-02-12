// GameInventory.jsx
import React, { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  Badge,
  IconButton,
  Heading,
  HStack,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  Spinner,
  useToast,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Package, Zap, Crown, Shield, Clock, ChevronLeft } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { activateAbility } from '../../redux/inventorySlice'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import BadgesSection from './gameInventoryComponents/BadgesSection'

const ABILITY_ICONS = {
  BOOST: <Zap size={20} />,
  POWER_UP: <Crown size={20} />,
  BADGE: <Shield size={20} />,
}

const ExpiryTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const { t } = useTranslation('GameInventory')

  const timerSize = useBreakpointValue({
    base: {
      clockSize: 9,
      fontSize: '0.6rem',
      px: '1',
      py: '0.25',
      ml: '1',
    },
    md: {
      clockSize: 11,
      fontSize: '0.7rem',
      px: '1.5',
      py: '0.5',
      ml: '1',
    },
  })

  const calculateTimeLeft = useCallback(() => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry - now

    if (diff <= 0) return t('timer.expired')

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return t('timer.daysAndHours', { days, hours })
    } else if (hours > 0) {
      return t('timer.hoursAndMinutes', { hours, minutes })
    } else {
      return t('timer.minutes', { minutes })
    }
  }, [expiresAt, t])

  useEffect(() => {
    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  return (
    <Box
      as={motion.div}
      position="absolute"
      bottom="-3.5"
      right="-3.5"
      onClick={e => e.stopPropagation()}
      zIndex={2}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Flex
        align="center"
        bg="rgba(0, 0, 0, 0.85)"
        backdropFilter="blur(8px)"
        px={timerSize.px}
        py={timerSize.py}
        rounded="full"
        border="1px solid"
        borderColor="whiteAlpha.200"
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
        _hover={{
          borderColor: 'whiteAlpha.300',
        }}
        transition="all 0.2s"
        userSelect="none"
      >
        <Clock
          size={timerSize.clockSize}
          color="white"
          opacity={0.8}
          strokeWidth={2.5}
        />
        <Text
          ml={timerSize.ml}
          fontSize={timerSize.fontSize}
          fontWeight="medium"
          color="white"
          letterSpacing="tight"
          whiteSpace="nowrap"
        >
          {timeLeft}
        </Text>
      </Flex>
    </Box>
  )
}

const AbilityCard = ({ item, isActive, onClick, variants }) => {
  const { t } = useTranslation('GameInventory')

  const getRarityStyle = useCallback(rarity => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return {
          bgGradient: 'linear(to-br, yellow.400, orange.500)',
          shadow: 'lg',
        }
      case 'epic':
        return {
          bgGradient: 'linear(to-br, purple.400, pink.600)',
          shadow: 'lg',
        }
      case 'rare':
        return {
          bgGradient: 'linear(to-br, blue.400, cyan.600)',
          shadow: 'lg',
        }
      default:
        return {
          bgGradient: 'linear(to-br, gray.400, gray.600)',
          shadow: 'lg',
        }
    }
  }, [])

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Box
        {...getRarityStyle(item.rarity)}
        p="4"
        rounded="lg"
        position="relative"
        cursor="pointer"
        onClick={() => (isActive ? null : onClick(item))}
        border={isActive ? '2px solid' : 'none'}
        borderColor={isActive ? 'green.400' : 'transparent'}
        _before={
          isActive
            ? {
                content: '""',
                position: 'absolute',
                inset: '-4px',
                borderRadius: 'lg',
                background:
                  'linear-gradient(45deg, #00ff8811, #00ff8844, #00ff8811)',
                filter: 'blur(8px)',
                zIndex: -1,
              }
            : {}
        }
      >
        <Box position="absolute" inset="0" bg="blackAlpha.300" rounded="lg" />
        <VStack position="relative" spacing="2">
          <Flex
            bg="blackAlpha.300"
            p="2"
            rounded="full"
            justify="center"
            align="center"
          >
            {ABILITY_ICONS[item.type] || <Package size={24} />}
          </Flex>
          <Text fontSize="sm" fontWeight="bold" textAlign="center">
            {item.name}
          </Text>
          {item.multiplier && (
            <Badge
              position="absolute"
              top="-1"
              left="-1"
              bg="blackAlpha.700"
              px="2"
              rounded="full"
              color="yellow.300"
            >
              {t('status.multiplier', { value: item.multiplier })}
            </Badge>
          )}
          <Badge
            position="absolute"
            top="-1"
            right={isActive ? '-4' : '-1'}
            bg="blackAlpha.700"
            px="2"
            rounded="full"
            color={isActive ? 'green.300' : 'yellow.300'}
          >
            {isActive
              ? t('status.active')
              : t('status.quantity', { count: item.quantity || 1 })}
          </Badge>
          {item.expiresAt && <ExpiryTimer expiresAt={item.expiresAt} />}
        </VStack>
      </Box>
    </motion.div>
  )
}

const DrawerHeader = ({ filters, selectedCategory, setSelectedCategory }) => {
  const { t } = useTranslation('GameInventory')

  return (
    <Box borderBottomWidth="1px" borderColor="gray.700" pb="4">
      <Heading
        textAlign="center"
        bgGradient="linear(to-r, yellow.200, yellow.500)"
        bgClip="text"
        fontSize="2xl"
        mb="4"
      >
        {t('header.title')}
      </Heading>
      <HStack overflowX="auto" py="2" spacing="2">
        {filters.map(filter => (
          <Button
            key={filter.id}
            onClick={() => setSelectedCategory(filter.id)}
            bgGradient={
              selectedCategory === filter.id
                ? 'linear(to-r, blue.500, purple.500)'
                : ''
            }
            bg={selectedCategory !== filter.id ? 'gray.800' : ''}
            _hover={{
              bg: selectedCategory !== filter.id ? 'gray.700' : '',
            }}
            leftIcon={filter.icon}
            size="sm"
            whiteSpace="nowrap"
            color="white"
          >
            {t(`filters.${filter.id.toLowerCase()}`)}
          </Button>
        ))}
      </HStack>
    </Box>
  )
}

const GameInventory = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('BOOST')
  const [selectedItem, setSelectedItem] = useState(null)
  const dispatch = useDispatch()
  const toast = useToast()
  const { t } = useTranslation('GameInventory')

  const { activeAbilities, availableAbilities, loading, error } = useSelector(
    state => state.inventory,
  )

  const filters = [
    { id: 'BOOST', name: t('filters.boost'), icon: <Zap /> },
    { id: 'POWER_UP', name: t('filters.powerUp'), icon: <Crown /> },
    { id: 'BADGE', name: t('filters.badge'), icon: <Shield /> },
  ]

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  }

  const handleActivateAbility = useCallback(
    async abilityId => {
      try {
        await dispatch(activateAbility(abilityId)).unwrap()
        toast({
          title: t('notifications.abilityActivated.title'),
          description: t('notifications.abilityActivated.description'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        setSelectedItem(null)
      } catch (error) {
        toast({
          title: t('notifications.activationFailed.title'),
          description: error || t('notifications.activationFailed.description'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [dispatch, toast, t],
  )

  const filteredActiveAbilities = activeAbilities.filter(
    item => selectedCategory === 'all' || item.type === selectedCategory,
  )

  const filteredAvailableAbilities = availableAbilities.filter(
    item => selectedCategory === 'all' || item.type === selectedCategory,
  )

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent
          bgGradient="linear(to-br, gray.900, gray.800)"
          color="white"
        >
          <IconButton
            icon={<ChevronLeft />}
            position="absolute"
            left="4"
            top="4"
            onClick={onClose}
            variant="ghost"
            color="white"
            zIndex="1"
          />

          <DrawerBody p="4">
            <DrawerHeader
              filters={filters}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {loading ? (
              <Flex justify="center" align="center" h="full">
                <Spinner size="xl" color="blue.400" />
              </Flex>
            ) : (
              <VStack spacing="6" align="stretch" mt="4">
                {filteredActiveAbilities.length > 0 && (
                  <Box>
                    <Heading
                      size="md"
                      mb="4"
                      bgGradient="linear(to-r, green.300, teal.300)"
                      bgClip="text"
                    >
                      {t('sections.activeAbilities')}
                    </Heading>
                    <Grid templateColumns="repeat(2, 1fr)" gap="3">
                      {filteredActiveAbilities.map(item => (
                        <AbilityCard
                          key={item.id}
                          item={item}
                          isActive={true}
                          onClick={setSelectedItem}
                          variants={itemVariants}
                        />
                      ))}
                    </Grid>
                  </Box>
                )}

                {filteredAvailableAbilities.length > 0 && (
                  <Box>
                    <Heading
                      size="md"
                      mb="4"
                      bgGradient="linear(to-r, blue.300, purple.300)"
                      bgClip="text"
                    >
                      {t('sections.availableAbilities')}
                    </Heading>
                    <Grid templateColumns="repeat(2, 1fr)" gap="3">
                      {filteredAvailableAbilities.map(item => (
                        <AbilityCard
                          key={item.id}
                          item={item}
                          isActive={false}
                          onClick={setSelectedItem}
                          variants={itemVariants}
                        />
                      ))}
                    </Grid>
                  </Box>
                )}

                {filteredActiveAbilities.length === 0 &&
                  filteredAvailableAbilities.length === 0 &&
                  selectedCategory !== 'BADGE' && (
                    <Flex
                      justify="center"
                      align="center"
                      h="40vh"
                      direction="column"
                      spacing={4}
                    >
                      <Package size={48} />
                      <Text mt={4}>{t('empty.noItems')}</Text>
                    </Flex>
                  )}

                {selectedCategory === 'BADGE' && <BadgesSection />}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Item Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(12px)" bg="rgba(0, 0, 0, 0.8)" />
        <ModalContent
          maxW="320px"
          bg="#1F2937"
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="0 0 20px rgba(0, 0, 0, 0.4)"
          p={0}
        >
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Box pos="relative" px={6} pt={8} pb={6}>
                <Flex direction="column" align="center" mb={6}>
                  <Box bg="#2D3748" p={4} rounded="xl" mb={3}>
                    <Zap size={24} color="white" />
                  </Box>
                  <Text
                    fontSize="2xl"
                    fontWeight="semibold"
                    color="white"
                    textAlign="center"
                  >
                    {selectedItem.name}
                  </Text>

                  <HStack spacing={2} mt={2}>
                    <Badge
                      bg="#374151"
                      color="whiteAlpha.900"
                      px={3}
                      py={1}
                      rounded="full"
                      fontSize="sm"
                    >
                      {t(`ability.type.${selectedItem.type.toLowerCase()}`)}
                    </Badge>
                    <Badge
                      bg="#374151"
                      color="whiteAlpha.900"
                      px={3}
                      py={1}
                      rounded="full"
                      fontSize="sm"
                    >
                      {t('status.multiplier', {
                        value: selectedItem?.multiplier || 1,
                      })}
                    </Badge>
                  </HStack>
                </Flex>

                <Button
                  onClick={() => handleActivateAbility(selectedItem.id)}
                  w="full"
                  h="50px"
                  rounded="xl"
                  fontSize="lg"
                  bg="#34D399"
                  color="white"
                  _hover={{
                    bg: '#10B981',
                    transform: 'translateY(-1px)',
                  }}
                  _active={{
                    bg: '#059669',
                    transform: 'translateY(0)',
                  }}
                  isLoading={loading}
                  loadingText={t('actions.activating')}
                  transition="all 0.2s"
                >
                  {t('actions.activate')}
                </Button>
              </Box>
            </motion.div>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default GameInventory

import React, { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, Bolt, Clock, LayoutPanelTop } from 'lucide-react'
import BaseRewardDisplay from '../../common/BaseRewardDisplay'
import { OrbAnimation, ParticleField } from './components'
import useRewardState from '../../hooks/useRewardState'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { claimAbility } from '../../../../redux/inventorySlice'
import { categories } from '../../../../assets/Categories'

const PowerUpDisplay = ({ reward, onClaim, claimed: initialClaimed }) => {
  const [showEffects, setShowEffects] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const { claimed, handleClaim } = useRewardState({
    onClaim,
    initialClaimed,
  })
  const { t } = useTranslation('rewards')
  const dispatch = useDispatch()

  // Filter categories - exclude 'all', 'top', 'general'
  const availableCategories = categories.filter(
    cat => !['all', 'top', 'general'].includes(cat.key),
  )

  useEffect(() => {
    const timer = setTimeout(() => setShowEffects(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClaimClick = () => {
    handleClaim()
    if (reward.isCategoryBoost) {
      dispatch(
        claimAbility({
          abilityId: reward._id,
          category: selectedCategory,
        }),
      )
    } else {
      dispatch(claimAbility({ abilityId: reward._id }))
    }
  }

  const isClaimDisabled = reward.isCategoryBoost && !selectedCategory

  return (
    <BaseRewardDisplay
      reward={reward}
      claimed={claimed}
      onClaim={handleClaim}
      type="POWER_UP"
    >
      {showEffects && <ParticleField />}

      <VStack spacing={{ base: 6, md: 8 }} w="full" px={4} maxW="md" mx="auto">
        <Box w="full" pt={{ base: 8, md: 12 }} pb={4}>
          <OrbAnimation powerLevel={reward.powerLevel || 1} />
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ width: '100%' }}
        >
          <VStack spacing={{ base: 4, md: 6 }}>
            <Badge
              colorScheme="cyan"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {t('powerUp.badge.special')}
            </Badge>

            <Text
              fontSize={{ base: '2xl', md: '4xl' }}
              fontWeight="bold"
              bgGradient="linear(to-r, cyan.300, blue.400)"
              bgClip="text"
              textAlign="center"
              letterSpacing="wide"
            >
              {reward.title || t('powerUp.title')}
            </Text>

            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="whiteAlpha.800"
              textAlign="center"
              px={4}
              maxW="sm"
            >
              {reward.description || t('powerUp.subtitle')}
            </Text>

            <Box w="full" pt={{ base: 4, md: 6 }}>
              <AnimatePresence mode="wait">
                {!claimed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ delay: 0.4 }}
                    style={{ width: '100%' }}
                  >
                    <VStack spacing={4} width="full">
                      {reward.isCategoryBoost && (
                        <FormControl>
                          <FormLabel
                            color="whiteAlpha.900"
                            fontSize="lg"
                            textAlign="center"
                          >
                            {t('powerUp.selectCategory')}
                          </FormLabel>
                          <Select
                            placeholder={t('Select a category')}
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            bg="whiteAlpha.100"
                            color="white"
                            borderColor="whiteAlpha.300"
                            _hover={{
                              borderColor: 'cyan.300',
                            }}
                            _focus={{
                              borderColor: 'cyan.400',
                              boxShadow:
                                '0 0 0 1px var(--chakra-colors-cyan-400)',
                            }}
                          >
                            {availableCategories.map(cat => (
                              <option
                                key={cat.key}
                                value={cat.key}
                                style={{
                                  backgroundColor: '#2D3748',
                                  color: 'white',
                                }}
                              >
                                {cat.label}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      <Button
                        onClick={handleClaimClick}
                        size="lg"
                        height="16"
                        width="full"
                        bgGradient="linear(to-r, cyan.500, blue.500)"
                        _hover={{
                          bgGradient: 'linear(to-r, cyan.600, blue.600)',
                          transform: 'scale(1.02)',
                        }}
                        _active={{
                          transform: 'scale(0.98)',
                        }}
                        color="white"
                        fontSize="xl"
                        fontWeight="bold"
                        rounded="2xl"
                        leftIcon={<Bolt size={22} />}
                        rightIcon={<LayoutPanelTop size={22} />}
                        transition="all 0.2s"
                        isDisabled={isClaimDisabled}
                        _disabled={{
                          opacity: 0.6,
                          cursor: 'not-allowed',
                          _hover: {
                            transform: 'none',
                          },
                        }}
                      >
                        {t('powerUp.button.activate')}
                      </Button>
                    </VStack>
                  </motion.div>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <HStack
                      spacing={3}
                      justify="center"
                      color="cyan.300"
                      fontSize={{ base: 'xl', md: '2xl' }}
                      fontWeight="bold"
                    >
                      <Sparkles size={24} />
                      <Text>{t('powerUp.button.activated')}</Text>
                      <Sparkles size={24} />
                    </HStack>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </VStack>
        </motion.div>
      </VStack>
    </BaseRewardDisplay>
  )
}

export default PowerUpDisplay

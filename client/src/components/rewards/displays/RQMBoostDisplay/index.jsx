import React, { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Target, Stars, Brain } from 'lucide-react'
import BaseRewardDisplay from '../../common/BaseRewardDisplay'
import { RocketAnimation, FloatingParticles } from './components'
import useRewardState from '../../hooks/useRewardState'
import { claimQuinBoost } from '../../../../utils/quiz.utils'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { claimAbility } from '../../../../redux/inventorySlice'
import { categories } from '../../../../assets/Categories'

const RQMBoostDisplay = ({ reward, onClaim, claimed: initialClaimed }) => {
  const [showEffects, setShowEffects] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const { claimed, showSuccess, handleClaim } = useRewardState({
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
    if (reward.name !== 'QuinBoost' && !reward.isCategoryBoost) {
      dispatch(claimAbility({ abilityId: reward._id }))
    } else if (reward.isCategoryBoost) {
      dispatch(
        claimAbility({
          abilityId: reward._id,
          category: selectedCategory,
        }),
      )
    } else {
      claimQuinBoost()
    }
  }

  const isClaimDisabled = reward.isCategoryBoost && !selectedCategory

  return (
    <BaseRewardDisplay
      reward={reward}
      claimed={claimed}
      onClaim={handleClaim}
      type="RQM_BOOST"
    >
      <React.Fragment key={'RQM-boost-display'}>
        {showEffects && <FloatingParticles />}

        <VStack
          spacing={{ base: 6, md: 8 }}
          w="full"
          px={4}
          maxW="md"
          mx="auto"
        >
          <Box w="full" pt={{ base: 8, md: 12 }} pb={4}>
            <RocketAnimation multiplier={reward.multiplier} />
          </Box>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ width: '100%' }}
          >
            <VStack spacing={{ base: 4, md: 6 }}>
              <Text
                fontSize={{ base: '2xl', md: '4xl' }}
                fontWeight="bold"
                bgGradient="linear(to-r, purple.300, pink.300)"
                bgClip="text"
                textAlign="center"
                letterSpacing="wide"
              >
                {reward.title || t('rqmBoost.title')}
              </Text>

              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="whiteAlpha.800"
                textAlign="center"
                px={4}
                maxW="sm"
              >
                {reward.description || t('rqmBoost.subtitle')}
              </Text>

              <HStack
                justify="center"
                spacing={{ base: 5, md: 12 }}
                color="purple.300"
                py={2}
              >
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Target size={20} />
                  <Text fontSize={{ base: 'md', md: 'lg' }}>
                    {t('rqmBoost.features.score')}
                  </Text>
                </HStack>
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Brain size={20} />
                  <Text fontSize={{ base: 'md', md: 'lg' }}>
                    {t('rqmBoost.features.iq')}
                  </Text>
                </HStack>
              </HStack>

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
                              {t('Select Category for Boost')}
                            </FormLabel>
                            <Select
                              placeholder={t('Select a category')}
                              value={selectedCategory}
                              onChange={e =>
                                setSelectedCategory(e.target.value)
                              }
                              bg="whiteAlpha.100"
                              color="white"
                              borderColor="whiteAlpha.300"
                              _hover={{
                                borderColor: 'purple.300',
                              }}
                              _focus={{
                                borderColor: 'purple.400',
                                boxShadow: '0 0 0 1px #805AD5',
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
                          bgGradient="linear(to-r, purple.500, pink.500)"
                          _hover={{
                            bgGradient: 'linear(to-r, purple.600, pink.600)',
                            transform: 'scale(1.02)',
                          }}
                          _active={{
                            transform: 'scale(0.98)',
                          }}
                          color="white"
                          fontSize="xl"
                          fontWeight="bold"
                          rounded="2xl"
                          leftIcon={<Zap size={22} />}
                          rightIcon={<Stars size={22} />}
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
                          {t('rqmBoost.button.activate')}
                        </Button>
                      </VStack>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <HStack
                        spacing={3}
                        justify="center"
                        color="purple.300"
                        fontSize={{ base: 'xl', md: '2xl' }}
                        fontWeight="bold"
                      >
                        <Sparkles size={24} />
                        <Text>{t('rqmBoost.button.activated')}</Text>
                        <Sparkles size={24} />
                      </HStack>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </VStack>
          </motion.div>
        </VStack>
      </React.Fragment>
    </BaseRewardDisplay>
  )
}

export default RQMBoostDisplay

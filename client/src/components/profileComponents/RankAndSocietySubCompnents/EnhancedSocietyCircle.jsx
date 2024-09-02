import React from 'react'
import {
  Flex,
  Image,
  Tooltip,
  Text,
  Box,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import CrownSVG from '../../../assets/svg/CrownSVG'

const EnhancedSocietyCircle = ({
  societyData,
  handleBrainClick,
  handleCircleClick,
}) => {
  const dimensions = useBreakpointValue({
    base: { width: 80, height: 80 },
    md: { width: 100, height: 100 },
  })

  const isTitans = societyData.society.toLowerCase().includes('titans')

  return (
    <Box
      bg={isTitans ? 'rgba(25, 25, 35, 0.9)' : 'rgba(25, 25, 35, 0.7)'}
      borderRadius="xl"
      p={6}
      boxShadow={societyData.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)'}
      w="100%"
      border={isTitans ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'}
    >
      <Text color="#9CAFAA" fontSize="lg" mb={4} textAlign="center">
        Society and Circle
      </Text>
      <Flex align="center" justify="space-between" w="100%" h="80%">
        <Tooltip label={`${societyData.society}`}>
          <Flex direction="column" align="center" flex={1}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBrainClick}
            >
              <Box position="relative">
                {isTitans && (
                  <Box
                    position="absolute"
                    top="-20px"
                    left="50%"
                    transform="translateX(-50%)"
                  >
                    <CrownSVG size={24} color="gold" />
                  </Box>
                )}
                <Image
                  src={societyData.image}
                  alt={societyData.society}
                  width={{ base: '80px', md: '100px' }}
                  height={{ base: '80px', md: '100px' }}
                  borderRadius="full"
                  border={isTitans ? '2px solid gold' : 'none'}
                />
              </Box>
            </motion.div>
            <Box
              mt={2}
              borderRadius="md"
              bg={isTitans ? 'rgba(255, 215, 0, 0.1)' : 'transparent'}
            >
              <Text
                color={isTitans ? 'gold' : societyData.textColor}
                fontWeight="bold"
                fontSize="lg"
                textShadow={
                  isTitans ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none'
                }
              >
                {societyData.society.split(' ')[0]}
              </Text>
            </Box>
          </Flex>
        </Tooltip>
        {societyData.circle && (
          <>
            <Flex
              direction="column"
              align="center"
              justify="center"
              flex={1}
              mb={'2rem'}
            >
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg width="60" height="30" viewBox="0 0 60 30">
                  <path
                    d="M0 15 H45 M40 7 L52 15 L40 23"
                    stroke={isTitans ? 'gold' : '#9CAFAA'}
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </motion.div>
            </Flex>
            <Tooltip label={`${societyData.circle}`}>
              <Flex direction="column" align="center" flex={1}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCircleClick}
                >
                  <svg
                    width={dimensions.width}
                    height={dimensions.height}
                    viewBox="0 0 120 120"
                  >
                    <defs>
                      <linearGradient
                        id="circleGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor={societyData.textColor}
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor={societyData.textColor}
                          stopOpacity="0.8"
                        />
                      </linearGradient>
                    </defs>
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="transparent"
                      stroke="url(#circleGradient)"
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill={
                        isTitans
                          ? 'rgba(25, 25, 35, 0.9)'
                          : 'rgba(25, 25, 35, 0.7)'
                      }
                    />
                    <text
                      x="60"
                      y="50"
                      textAnchor="middle"
                      fill={isTitans ? 'gold' : societyData.textColor}
                      fontSize="16"
                      fontWeight="bold"
                    >
                      IQ Range
                    </text>
                    <text
                      x="60"
                      y="80"
                      textAnchor="middle"
                      fill={isTitans ? 'gold' : '#9CAFAA'}
                      fontSize="18"
                      fontWeight="bold"
                    >
                      {societyData.IQ_Lower}
                      {societyData.IQ_Upper
                        ? ` - ${societyData.IQ_Upper}`
                        : '+'}
                    </text>
                  </svg>
                </motion.div>
                <Text
                  color={societyData.textColor}
                  fontWeight="bold"
                  mt={2}
                  fontSize="lg"
                >
                  {societyData.circle.split(' ')[0]}
                </Text>
              </Flex>
            </Tooltip>
          </>
        )}
      </Flex>
    </Box>
  )
}

export default EnhancedSocietyCircle

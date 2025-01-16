import React from 'react'
import { motion } from 'framer-motion'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Box,
  Flex,
  Button,
  VStack,
  Badge,
  useMediaQuery,
  ModalCloseButton,
} from '@chakra-ui/react'
import { Bookmark, Clock, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CategoryBoostModal = ({ isOpen, onClose, isBoostActive }) => {
  const { t } = useTranslation('CategoryBoostModal')
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

  // Check if current day is between Monday and Friday
  const today = new Date().getDay()
  const isWeekday = today >= 1 && today <= 5

  const MotionBox = motion(Box)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isLargerThan768 ? '2xl' : 'full'}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(8px)" />
      <ModalContent
        bg="linear-gradient(135deg, #000000 0%, #1a1a1a 100%)"
        color="white"
        mx={4}
        borderRadius="xl"
        boxShadow="0 0 20px rgba(255, 255, 255, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.1)"
      >
        <ModalCloseButton />
        <ModalHeader>
          <Flex
            direction="column"
            align="center"
            pb={6}
            borderBottom="2px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
          >
            <Flex align="center" gap={3}>
              <Bookmark size={28} color="#10B981" />
              <Text
                fontSize={['3xl', '4xl']}
                fontWeight="bold"
                bgGradient="linear(to-r, #10B981, #059669)"
                bgClip="text"
                letterSpacing="wide"
              >
                {t('Category Boost')}
              </Text>
              <Bookmark size={28} color="#10B981" />
            </Flex>
            <Text
              color="gray.400"
              fontSize="lg"
              fontStyle="italic"
              mt={3}
              textAlign="center"
            >
              {t('Master New Categories')}
            </Text>
          </Flex>
        </ModalHeader>

        <ModalBody py={8}>
          <VStack spacing={8}>
            <MotionBox
              w="full"
              bg={
                isWeekday
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(255, 255, 255, 0.05)'
              }
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor={
                isWeekday
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)'
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              _hover={{
                transform: 'translateY(-2px)',
                bg: isWeekday
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Flex align="center" gap={3} mb={4}>
                <Calendar size={24} color="#10B981" />
                <Text fontSize="xl" fontWeight="bold">
                  {isWeekday
                    ? t('Weekday Boost Available')
                    : t('Weekend - No Boost')}
                </Text>
              </Flex>

              <Box mb={4}>
                <Flex justify="space-between" mb={2}>
                  <Text color="gray.300">{t('Availability')}</Text>
                  <Badge
                    bg={
                      isWeekday
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)'
                    }
                    color={isWeekday ? '#10B981' : 'gray.400'}
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {isWeekday ? t('Active Now') : t('Available Mon-Fri')}
                  </Badge>
                </Flex>
              </Box>

              <Text color="gray.400" fontSize="md" textAlign="center">
                {isWeekday
                  ? t('Boost active during weekdays!')
                  : t('Category Boost returns on Monday')}
              </Text>
            </MotionBox>

            <MotionBox
              w="full"
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              _hover={{
                transform: 'translateY(-2px)',
                bg: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Flex align="center" gap={3} mb={4}>
                <Bookmark size={24} color="#10B981" />
                <Text fontSize="xl" fontWeight="bold">
                  {t('Exclusive Boost for Special Players')}
                </Text>
              </Flex>
              <Text color="gray.400">
                {t(
                  'Complete categories on weekdays to earn great rewards and unlock special achievements!',
                )}
              </Text>
            </MotionBox>

            <MotionBox
              w="full"
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              _hover={{
                transform: 'translateY(-2px)',
                bg: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Flex align="center" gap={3} mb={4}>
                <Clock size={24} color="#10B981" />
                <Text fontSize="xl" fontWeight="bold">
                  {t('Boost Schedule')}
                </Text>
              </Flex>
              <Text color="gray.400">
                {t(
                  'Category Boost is available Monday to Friday. Plan your learning to maximize XP gains!',
                )}
              </Text>
            </MotionBox>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTop="2px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          pt={6}
        >
          <Button
            w="full"
            size="lg"
            bg="linear-gradient(90deg, #10B981, #059669)"
            color="white"
            _hover={{
              bg: 'linear-gradient(90deg, #059669, #047857)',
              transform: 'translateY(-2px)',
            }}
            onClick={onClose}
            fontWeight="bold"
            letterSpacing="wide"
          >
            {t('Continue')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CategoryBoostModal

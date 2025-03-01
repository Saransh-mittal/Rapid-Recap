import React, { memo } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Icon,
  HStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiZap, FiArrowLeft } from 'react-icons/fi'
import { Target, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const QuickClashHeader = ({ onNewChallenge }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()

  const handleBackToHome = () => {
    navigate('/home')
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <MotionButton
          leftIcon={<FiArrowLeft />}
          onClick={handleBackToHome}
          variant="ghost"
          color="whiteAlpha.800"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
          size="sm"
          fontWeight="normal"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('Back to Home')}
        </MotionButton>
      </Flex>

      <Flex
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', md: 'center' }}
        mb={8}
        gap={4}
      >
        <Box>
          <Heading
            size={{ base: 'xl', md: '2xl' }}
            color="purple.300"
            mb={2}
            textAlign={{ base: 'center', md: 'left' }}
          >
            <Flex alignItems="center">
              <Icon as={Target} mr={2} />
              {t('Quick Clash')}
            </Flex>
          </Heading>

          <Text
            color="whiteAlpha.800"
            fontSize="md"
            textAlign={{ base: 'center', md: 'left' }}
          >
            {t(
              'Challenge other players to rapid-fire reading and quiz battles, test your knowledge and rise up the ranks!',
            )}
          </Text>
        </Box>

        <Button
          leftIcon={<FiZap />}
          bg="purple.600"
          _hover={{ bg: 'purple.700' }}
          onClick={onNewChallenge}
          size="md"
          mx={{ base: 'auto', md: 0 }}
          color={'white'}
        >
          {t('New Challenge')}
        </Button>
      </Flex>
    </MotionBox>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(QuickClashHeader)

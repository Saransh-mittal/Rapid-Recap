import React, { memo } from 'react'
import { Box, VStack, HStack, Text, Icon, Button } from '@chakra-ui/react'
import { Brain } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Button to generate analysis when no analysis exists yet
 */
const GenerateAnalysisButton = ({ onViewFull }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      p={2.5}
      borderRadius="lg"
      bg="rgba(26, 21, 39, 0.85)"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
      borderWidth="1.5px"
      borderColor="blue.500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      position="relative"
      overflow="hidden"
      _hover={{
        borderColor: 'blue.400',
        boxShadow: '0 4px 16px rgba(66, 153, 225, 0.3)',
      }}
    >
      <VStack spacing={1.5}>
        <HStack spacing={1.5}>
          <Icon as={Brain} color="blue.400" boxSize={3.5} />
          <Text color="whiteAlpha.900" fontSize="xs" fontWeight="medium">
            {t('AI Analysis Available')}
          </Text>
        </HStack>

        <MotionButton
          onClick={onViewFull}
          colorScheme="blue"
          size="xs"
          width="100%"
          leftIcon={<Brain size={12} />}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {t('Generate Analysis')}
        </MotionButton>
      </VStack>
    </MotionBox>
  )
}

export default memo(GenerateAnalysisButton)

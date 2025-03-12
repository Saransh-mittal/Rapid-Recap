import React from 'react'
import { HStack, Button, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Zap, Shield, Target } from 'lucide-react'

const MotionHStack = motion(HStack)

/**
 * Individual filter tab component
 */
const FilterTab = ({ isSelected, label, icon, onClick }) => {
  return (
    <Button
      variant={isSelected ? 'solid' : 'ghost'}
      colorScheme={isSelected ? 'purple' : 'white'}
      leftIcon={<Icon as={icon} boxSize={4} />}
      onClick={onClick}
      borderRadius="full"
      size="sm"
      fontWeight={isSelected ? 'bold' : 'medium'}
      px={4}
      boxShadow={isSelected ? '0 0 12px rgba(124, 58, 237, 0.3)' : 'none'}
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      }}
    >
      {label}
    </Button>
  )
}

/**
 * Filter tabs component for filtering challenges
 */
const FilterTabs = ({ selectedFilter, onFilterChange }) => {
  const { t } = useTranslation('QuickClash')

  // Animation variants
  const tabContainerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.3,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  }

  const tabVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <MotionHStack
      spacing={3}
      p={2}
      borderRadius="full"
      bg="rgba(26, 32, 44, 0.6)"
      justify="center"
      overflowX="auto"
      mx="auto"
      maxW="350px"
      boxShadow="0 5px 15px rgba(0, 0, 0, 0.1)"
      variants={tabContainerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={tabVariants}>
        <FilterTab
          isSelected={selectedFilter === 'all'}
          label={t('All')}
          icon={Zap}
          onClick={() => onFilterChange('all')}
        />
      </motion.div>
      <motion.div variants={tabVariants}>
        <FilterTab
          isSelected={selectedFilter === 'sent'}
          label={t('Sent')}
          icon={Shield}
          onClick={() => onFilterChange('sent')}
        />
      </motion.div>
      <motion.div variants={tabVariants}>
        <FilterTab
          isSelected={selectedFilter === 'received'}
          label={t('Received')}
          icon={Target}
          onClick={() => onFilterChange('received')}
        />
      </motion.div>
    </MotionHStack>
  )
}

export default FilterTabs

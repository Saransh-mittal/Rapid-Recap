// components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryIcon.jsx
import React, { memo } from 'react'
import { Icon, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion.div

/**
 * Category Icon Component with animations
 */
const CategoryIcon = memo(({ categoryInfo }) => {
  const iconSize = useBreakpointValue({
    base: '24px',
    sm: '28px',
    md: '30px',
  })

  return (
    <MotionBox
      style={{
        background: `linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`,
        borderRadius: '8px',
        padding: useBreakpointValue({ base: '6px', sm: '8px' }),
        boxShadow: `0 4px 15px ${categoryInfo.primaryColor}40`,
      }}
      whileHover={{
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      }}
    >
      <Icon as={categoryInfo.iconComponent} boxSize={iconSize} color="white" />
    </MotionBox>
  )
})

CategoryIcon.displayName = 'CategoryIcon'

export default CategoryIcon

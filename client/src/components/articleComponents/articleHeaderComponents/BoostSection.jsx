import React from 'react'
import PowerBoostDisplay from './PowerBoostDisplay'
import { Box } from '@chakra-ui/react'
import Bubbles from '../../miscellaneous/Bubbles.jsx'

const BoostSection = React.memo(
  ({
    isQuinBoostAvailable,
    isStreakSurgeAvailable,
    isCategoryBoostAvailable,
    isBoosted,
    openModal,
    openStreakSurgeModal,
    openCategoryBoostModal,
  }) => {
    return (
      <Box
        cursor="pointer"
        transition="transform 0.2s, box-shadow 0.2s"
        zIndex={100}
      >
        {(isBoosted || isQuinBoostAvailable || isCategoryBoostAvailable) && (
          <Bubbles />
        )}
        <PowerBoostDisplay
          openModal={openModal}
          openStreakSurgeModal={openStreakSurgeModal}
          openCategoryBoostModal={openCategoryBoostModal}
          quinBoost={isQuinBoostAvailable}
          streakSurge={isStreakSurgeAvailable}
          categoryBoost={isCategoryBoostAvailable}
          isBoosted={isBoosted}
        />
      </Box>
    )
  },
)

BoostSection.displayName = 'BoostSection'

export default BoostSection

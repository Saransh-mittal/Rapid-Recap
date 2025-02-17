import React from 'react'
import PowerBoostDisplay from './PowerBoostDisplay'
import { Box } from '@chakra-ui/react'
import Bubbles from '../../miscellaneous/Bubbles.jsx'
import { useSelector } from 'react-redux'
import {
  calculateTotalEffect,
  getCategoryFromBoost,
  isCategoryBoost,
} from '../../../utils/helper.utils.js'
import { useMemo } from 'react'

const BoostSection = React.memo(
  ({ openModal, openStreakSurgeModal, openCategoryBoostModal, category }) => {
    const { activeAbilities } = useSelector(state => state.inventory)

    const filteredActiveAbilities = activeAbilities.filter(ability => {
      // Handle category boosts

      if (isCategoryBoost(ability.name)) {
        const boostCategory = getCategoryFromBoost(ability.name)

        return boostCategory.toLowerCase() === category.toLowerCase()
      }
      // Include all other types of boosts
      return true
    })
    const effects = useMemo(
      () => calculateTotalEffect(filteredActiveAbilities, 'BOOST'),
      [activeAbilities],
    )
    return (
      <Box
        cursor="pointer"
        transition="transform 0.2s, box-shadow 0.2s"
        zIndex={100}
      >
        {effects?.multiplier > 1 && <Bubbles />}
        <PowerBoostDisplay
          category={category}
          openModal={openModal}
          openStreakSurgeModal={openStreakSurgeModal}
          openCategoryBoostModal={openCategoryBoostModal}
        />
      </Box>
    )
  },
)

BoostSection.displayName = 'BoostSection'

export default BoostSection

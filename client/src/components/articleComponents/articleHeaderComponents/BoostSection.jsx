import React from 'react'
import PowerBoostDisplay from './PowerBoostDisplay'
import { Box } from '@chakra-ui/react'
import Bubbles from '../../miscellaneous/Bubbles.jsx'
import { useSelector } from 'react-redux'

const BoostSection = React.memo(
  ({ openModal, openStreakSurgeModal, openCategoryBoostModal, category }) => {
    const { effects } = useSelector(state => state.inventory)
    return (
      <Box
        cursor="pointer"
        transition="transform 0.2s, box-shadow 0.2s"
        zIndex={100}
      >
        {effects?.boost?.multiplier > 1 && <Bubbles />}
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

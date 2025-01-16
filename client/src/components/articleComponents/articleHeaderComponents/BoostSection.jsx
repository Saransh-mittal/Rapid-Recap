import React from 'react'
import PowerBoostDisplay from './PowerBoostDisplay'
import { Box } from '@chakra-ui/react'
import Bubbles from '../../miscellaneous/Bubbles.jsx'

const BoostSection = React.memo(
  ({
    isQuinBoostAvailable,
    isStreakSurgeAvailable,
    isCategoryBoostAvailable,
    quizLeftToGetQuizBoost,
    isBoosted,
    openModal,
    openStreakSurgeModal,
    openCategoryBoostModal,
    playClick,
    notLoggedIn,
    toast,
  }) => {
    const handleBoostClick = () => {
      playClick()
      if (notLoggedIn) {
        toast({
          title: 'Login Required',
          description: 'Please login to activate boosts',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      openModal()
    }

    return (
      <Box
        // onClick={handleBoostClick}
        cursor="pointer"
        transition="transform 0.2s, box-shadow 0.2s"
        zIndex={100}
      >
        <Bubbles />
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

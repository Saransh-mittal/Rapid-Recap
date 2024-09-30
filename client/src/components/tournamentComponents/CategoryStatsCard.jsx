import React, { Suspense } from 'react'
import {
  Box,
  VStack,
  Flex,
  HStack,
  Text,
  Progress,
  Spinner,
} from '@chakra-ui/react'

// Lazy load the CategoryCard
const CategoryCard = React.lazy(() => import('./CategoryCard'))
const TrophySVG = React.lazy(() => import('../../assets/svg/TrophySVG'))
const Target = React.lazy(() => import('../../assets/svg/Target'))
const ClockSVG = React.lazy(() => import('../../assets/svg/ClockSVG'))

const CategoryStatsCard = ({
  stat,
  t,
  isProfile = false,
  setShowQuizSummary,
  categoryAttempts = {},
}) => {
  return (
    <Box>
      <Suspense fallback={<Spinner />}>
        <CategoryCard
          category={stat?.category}
          isCompletedFromStats={categoryAttempts[stat?.category] >= 1}
          isSelected={false}
          onSelect={
            setShowQuizSummary
              ? _ => {
                  setShowQuizSummary(true)
                }
              : () => {}
          }
        />
      </Suspense>
      <VStack
        mt={2}
        bg="whiteAlpha.200"
        p={2}
        borderRadius="md"
        spacing={1}
        align="stretch"
      >
        <Flex justify="space-between">
          <HStack>
            <TrophySVG color="gold" size={16} />
            <Text fontSize="sm">
              {t('rank')}:{!isProfile && <>#</>}
              {stat.ranking}
            </Text>
          </HStack>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="cyan"
            ml={isProfile ? 2 : null}
          >
            {t('RQM')}:{' '}
            {!isProfile ? stat.RQM_score.toFixed(2) : stat.RQM_score.toFixed(0)}
          </Text>
        </Flex>
        {!isProfile && (
          <>
            <Progress
              value={(stat.score / 100) * 100}
              colorScheme="yellow"
              size="sm"
            />
            <Flex justify="space-between">
              <HStack>
                <Target color="cyan" size={16} />
                <Text fontSize="sm">
                  {t('right')}: {stat.score}
                </Text>
              </HStack>
              <HStack>
                <ClockSVG color="pink" size={16} />
                <Text fontSize="sm">{stat.timeTaken}s</Text>
              </HStack>
            </Flex>
          </>
        )}
      </VStack>
    </Box>
  )
}

export default CategoryStatsCard

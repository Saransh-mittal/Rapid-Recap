import React from 'react'
import { SimpleGrid, Button } from '@chakra-ui/react'

const FeedbackButtons = ({
  onStoryFeedbackAnalysisOpen,
  onQuizFeedbackAnalysisOpen,
  onTournamentFeedbackAnalysisOpen,
}) => {
  const buttonColorScheme = 'teal'

  return (
    <SimpleGrid columns={[1, null, 3]} spacing={4}>
      <Button
        colorScheme={buttonColorScheme}
        onClick={onStoryFeedbackAnalysisOpen}
      >
        Story Feedback
      </Button>
      <Button
        colorScheme={buttonColorScheme}
        onClick={onQuizFeedbackAnalysisOpen}
      >
        Quiz Feedback
      </Button>
      <Button
        colorScheme={buttonColorScheme}
        onClick={onTournamentFeedbackAnalysisOpen}
      >
        Tournament Feedback
      </Button>
    </SimpleGrid>
  )
}

export default FeedbackButtons

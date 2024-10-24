// src/components/quizComponents/ProgressSection.jsx
import React from 'react'
import ProgressBar from './ProgressBar'
import ProgressChart from './ProgressChart'

const ProgressSection = React.memo(
  ({
    step,
    rqmScore,
    pastRQMs,
    isTournament,
    progressBarDelay,
    progressChartDelay,
  }) => (
    <>
      <ProgressBar
        step={step}
        rqmScore={rqmScore}
        isTournament={isTournament}
        animationDelay={progressBarDelay}
      />
      <ProgressChart
        step={step}
        pastRQMs={pastRQMs}
        isTournament={isTournament}
        animationDelay={progressChartDelay}
      />
    </>
  ),
)

export default ProgressSection

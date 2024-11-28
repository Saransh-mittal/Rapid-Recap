export const getBoostReason = RQM_score => {
  if (RQM_score >= 100) return 'Extraordinary 100+ RQM'
  if (RQM_score >= 76) return 'Maestro RQM'
  if (RQM_score >= 51) return 'Expert RQM'
  return ''
}

export const calculateScoreData = (user, quizData) => {
  const originalIncrement = parseFloat(
    quizData?.iqData?.originalIncrement || 0,
  ).toFixed(1)
  const boostedIncrement = parseFloat(
    quizData?.iqData?.boostedIncrement || 0,
  ).toFixed(1)
  const additionalIncrement = (boostedIncrement - originalIncrement).toFixed(1)

  return {
    isGuest: user?.role === 'guest',
    needsOnboarding: user?.needsOnboarding,
    isPaused: quizData?.iqData?.pauseRealTimeIQ,
    prevScore: quizData?.iqData?.prevIQScore || user.IQ_score,
    newScore: quizData?.iqData?.newIQScore || user.IQ_score,
    boostMultiplier: quizData?.iqData?.boostMultiplier || 1,
    originalIncrement,
    additionalIncrement,
    boostedIncrement,
    RQM_score: quizData?.finalRQM || 0,
  }
}

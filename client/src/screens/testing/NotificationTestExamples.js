// NotificationTestExamples.js
import { addNoteMessageIfAllowed } from '../../redux/appSlice'

/**
 * Test functions for all notification types
 *
 * Usage: Import this file and call any test function to dispatch that notification type
 * Example: import { testBasicNotification } from './NotificationTestExamples';
 *          testBasicNotification(dispatch);
 */

// ==================== BASIC NOTIFICATIONS ====================

/**
 * Test a basic notification with text content
 */
export const testBasicNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      title: 'Information',
      content: 'This is a simple notification with text content.',
      duration: 7000,
      width: '320px',
      actions: [{ text: 'Okay', actionType: 'DISMISS' }],
    }),
  )
}

/**
 * Test a basic notification with actions
 */
export const testBasicNotificationWithActions = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      title: 'Action Required',
      content: 'This notification has multiple action buttons.',
      duration: null, // Won't auto-dismiss
      width: '320px',
      actions: [
        { text: 'View Profile', actionType: 'VIEW_PROFILE' },
        { text: 'Dismiss', actionType: 'DISMISS' },
      ],
    }),
  )
}

// ==================== XP AWARD NOTIFICATIONS ====================

/**
 * Test a standard XP award notification
 */
export const testXpAwardNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'xpAward',
      xpAwarded: 50,
      xpSource: 'Daily Quiz Completion',
      title: 'XP Awarded!',
      duration: 8000,
    }),
  )
}

/**
 * Test a milestone XP award notification
 */
export const testMilestoneXpAwardNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'xpAward',
      xpAwarded: 100,
      xpSource: 'First Tournament',
      isMilestone: true,
      milestoneContent: "You've completed your first tournament!",
      title: 'Achievement Unlocked',
      duration: 10000,
    }),
  )
}

/**
 * Test a named milestone XP award notification
 */
export const testNamedMilestoneXpAwardNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'xpAward',
      xpAwarded: 150,
      xpSource: 'Special Achievement',
      milestoneName: 'QUIN_BOOST', // Reference to a named milestone in milestones.js
      title: 'Major Achievement Unlocked',
      duration: 12000,
    }),
  )
}

/**
 * Test a level-up XP award notification
 */
export const testLevelUpXpAwardNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'xpAward',
      xpAwarded: 200,
      xpSource: 'Level Completion',
      isLevelUp: true,
      title: 'Level Up!',
      duration: 15000,
    }),
  )
}

// ==================== STREAK NOTIFICATIONS ====================

/**
 * Test an active streak notification
 */
export const testActiveStreakNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'streak',
      streakStatus: 'active',
      streakCount: 5,
      title: 'Streak Active',
      duration: 7000,
      width: '320px',
    }),
  )
}

/**
 * Test a broken streak notification
 */
export const testBrokenStreakNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'streak',
      streakStatus: 'broken',
      streakCount: 8,
      title: 'Streak Broken',
      duration: 10000,
      width: '320px',
    }),
  )
}

/**
 * Test a streak revival notification
 */
export const testStreakRevivalNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'streak',
      streakStatus: 'revival',
      streakCount: 7,
      remainingTime: 7200, // 2 hours in seconds
      remainingQuizzes: 3,
      title: 'Revive Your Streak!',
      duration: 15000,
      width: '320px',
    }),
  )
}

/**
 * Test a revived streak notification
 */
export const testRevivedStreakNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'streak',
      streakStatus: 'revived',
      streakCount: 7,
      title: 'Streak Revived!',
      duration: 8000,
      width: '320px',
    }),
  )
}

// ==================== TOURNAMENT NOTIFICATIONS ====================

/**
 * Test a tournament registration notification
 */
export const testTournamentRegistrationNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'tournament',
      tournamentStatus: 'registration',
      tournamentName: '#034',
      tournamentEndTime: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
      userStreak: 3,
      requiredStreak: 2,
      title: 'Tournament Registration Open',
      duration: 10000,
      width: '320px',
      actions: [
        {
          text: 'Register Now',
          actionType: 'REGISTER_TOURNAMENT',
        },
      ],
    }),
  )
}

/**
 * Test a tournament locked notification
 */
export const testTournamentLockedNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'tournament',
      tournamentStatus: 'locked',
      tournamentName: '#034',
      userStreak: 1,
      requiredStreak: 3,
      title: 'Tournament Locked',
      duration: 10000,
      width: '320px',
      messageForTournamentEligibility:
        'You need 2 more days in your streak to unlock this tournament!',
      actions: [
        {
          text: 'View Tournament',
          actionType: 'VIEW_TOURNAMENT',
        },
      ],
    }),
  )
}

/**
 * Test a tournament ongoing notification with leaderboard
 */
export const testTournamentOngoingNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'tournament',
      tournamentStatus: 'ongoing',
      tournamentName: '#034',
      title: 'Tournament Leaderboard',
      duration: 10000,
      width: '320px',
      leaderboard: [
        {
          userId: '1',
          inGameName: 'ChampionPlayer',
          score: 950,
          pic: '',
        },
        {
          userId: '2',
          inGameName: 'BrainWizard',
          score: 820,
          pic: '',
        },
        {
          userId: '3',
          inGameName: 'QuizMaster',
          score: 750,
          pic: '',
        },
      ],
      actions: [
        {
          text: 'View Tournament',
          actionType: 'VIEW_TOURNAMENT',
        },
      ],
    }),
  )
}

// ==================== QUICK CLASH NOTIFICATIONS ====================

/**
 * Test a new challenge Quick Clash notification
 */
export const testQuickClashNewChallengeNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'quickClash',
      eventType: 'newChallenge',
      data: {
        challenger: {
          inGameName: 'KnowledgeWarrior',
          pic: '',
        },
        challenge: {
          id: 'challenge123',
          category: 'World History',
          timeLimit: 30,
          description: 'Test your knowledge about ancient civilizations!',
        },
      },
      duration: 10000,
      width: '350px',
    }),
  )
}

/**
 * Test a challenge accepted Quick Clash notification
 */
export const testQuickClashChallengeAcceptedNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'quickClash',
      eventType: 'challengeAccepted',
      data: {
        opponent: {
          inGameName: 'BrainExpert',
          pic: '',
        },
        category: 'Science',
        challengeId: 'challenge456',
      },
      duration: 10000,
      width: '350px',
    }),
  )
}

/**
 * Test a challenge rejected Quick Clash notification
 */
export const testQuickClashChallengeRejectedNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'quickClash',
      eventType: 'challengeRejected',
      data: {
        opponent: {
          inGameName: 'HistoryBuff',
          pic: '',
        },
        category: 'Geography',
      },
      duration: 7000,
      width: '350px',
    }),
  )
}

/**
 * Test a challenge completed Quick Clash notification
 */
export const testQuickClashChallengeCompletedNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'quickClash',
      eventType: 'challengeCompleted',
      data: {
        opponent: {
          inGameName: 'QuizWhiz',
          pic: '',
        },
      },
      duration: 10000,
      width: '350px',
    }),
  )
}

/**
 * Test a both players completed challenge Quick Clash notification
 */
export const testQuickClashBothCompletedNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'quickClash',
      eventType: 'challengeCompletedByBothPlayers',
      data: {
        user: {
          inGameName: 'You',
          pic: '',
        },
        opponent: {
          inGameName: 'MindMaster',
          pic: '',
        },
        userScore: 850,
        opponentScore: 780,
        category: 'Sports',
      },
      duration: 15000,
      width: '350px',
    }),
  )
}

/**
 * Test an analysis ready Quick Clash notification
 */
export const testQuickClashAnalysisReadyNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'quickClash',
      eventType: 'analysisReady',
      data: {
        category: 'Science & Technology',
        analysisId: 'analysis789',
      },
      duration: 10000,
      width: '350px',
    }),
  )
}

// ==================== FEEDBACK NOTIFICATIONS ====================

/**
 * Test a story feedback notification
 */
export const testStoryFeedbackNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'storyFeedback',
      title: 'Rate the Article',
      storyId: 'story123',
      duration: null, // Don't auto-dismiss feedback requests
      width: '350px',
    }),
  )
}

/**
 * Test a quiz feedback notification
 */
export const testQuizFeedbackNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'quizFeedback',
      title: 'Rate the Quiz',
      quizId: 'quiz456',
      duration: null,
      width: '350px',
    }),
  )
}

/**
 * Test a tournament quiz feedback notification
 */
export const testTournamentQuizFeedbackNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      messageType: 'tournamentQuizFeedback',
      title: 'Rate the Tournament Quiz',
      tournamentId: 'tournament789',
      duration: null,
      width: '350px',
    }),
  )
}

// ==================== SPECIAL CASES ====================

/**
 * Test a performance warning notification
 */
export const testPerformanceWarningNotification = dispatch => {
  dispatch(
    addNoteMessageIfAllowed({
      title: 'Performance Warning',
      content:
        "We've detected your device might be struggling. Would you like to switch to low-performance mode?",
      duration: null,
      width: '350px',
      actions: [
        { text: 'Switch to Weak Mode', actionType: 'SWITCH_TO_WEAK_MODE' },
        { text: 'Stay in Normal Mode', actionType: 'STAY_IN_NORMAL_MODE' },
      ],
    }),
  )
}

/**
 * Test multiple notifications at once to see the summary view
 */
export const testMultipleNotifications = dispatch => {
  // Dispatch 4 different notifications
  testBasicNotification(dispatch)
  testXpAwardNotification(dispatch)
  testActiveStreakNotification(dispatch)
  testQuickClashNewChallengeNotification(dispatch)
}

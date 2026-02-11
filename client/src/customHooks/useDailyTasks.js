// customHooks/useDailyTasks.js
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchDailyTasks,
  updateTaskProgress,
  fetchTaskStatistics,
} from '../redux/quickClashDailyTasksSlice'
import { DAILY_TASKS_ENABLED } from '../utils/featureFlags'

/**
 * Custom hook for working with daily tasks and tracking progress
 */
const useDailyTasks = () => {
  const dispatch = useDispatch()
  // Select tasks data from Redux store
  const {
    tasks,
    tasksLoading,
    tasksError,
    justCompletedTaskId,
    lastClaimedReward,
    statistics,
    statisticsLoading,
  } = useSelector(state => state.quickClashDailyTasks)

  // Check if user is authenticated (not a session player)
  const { user } = useSelector(state => state.auth)
  const isAuthenticated = !!user
  const currentUserId = user?._id

  // Load tasks if they haven't been loaded yet - ONLY for authenticated users
  // Don't retry if there was an error (prevents infinite loop on 401)
  useEffect(() => {
    if (
      DAILY_TASKS_ENABLED &&
      isAuthenticated &&
      tasks.length === 0 &&
      !tasksLoading &&
      !tasksError
    ) {
      dispatch(fetchDailyTasks())
      dispatch(fetchTaskStatistics())
    }
  }, [dispatch, tasks.length, tasksLoading, tasksError, isAuthenticated])

  /**
   * Track individual challenge completion (called when a user completes their part)
   * Only updates non-win related tasks as winner is not determined yet
   * NOTE: Only runs for authenticated users, not session players
   */
  const trackChallengeCompletion = useCallback(
    async params => {
      if (!DAILY_TASKS_ENABLED) {
        return
      }

      // Skip for session players - they don't have daily tasks
      if (!isAuthenticated) {
        console.log('Skipping daily task tracking for session player')
        return
      }

      try {
        const { score, fromMatchmaking, readingTime, category } = params

        // Update basic challenge completion task - this happens regardless of win/loss
        try {
          await dispatch(
            updateTaskProgress({
              taskType: 'COMPLETE_CHALLENGES',
            }),
          ).unwrap()
        } catch (error) {
          console.error('Error updating complete challenges task:', error)
        }

        // If the challenge had a high RQM score
        if (score && score >= 30) {
          try {
            await dispatch(
              updateTaskProgress({
                taskType: 'ACHIEVE_RQM_SCORE',
                metadata: { score },
              }),
            ).unwrap()
          } catch (error) {
            console.error('Error updating RQM score task:', error)
          }
        }
        // If challenge was from matchmaking
        if (fromMatchmaking) {
          try {
            await dispatch(
              updateTaskProgress({
                taskType: 'COMPLETE_MATCHMAKING',
              }),
            ).unwrap()
          } catch (error) {
            console.error('Error updating matchmaking task:', error)
          }
        }

        // If reading time was tracked
        if (readingTime && readingTime >= 60) {
          try {
            await dispatch(
              updateTaskProgress({
                taskType: 'IMPROVE_READING_TIME',
                metadata: { readingTime },
              }),
            ).unwrap()
          } catch (error) {
            console.error('Error updating reading time task:', error)
          }
        }

        if (category) {
          try {
            await dispatch(
              updateTaskProgress({
                taskType: 'USE_CATEGORIES',
                metadata: { category },
              }),
            ).unwrap()
          } catch (error) {
            console.error('Error updating use categories task:', error)
          }
        }

        console.log('Successfully tracked non-win related task progress')
      } catch (error) {
        console.error('Error tracking challenge completion:', error)
      }
    },
    [dispatch, isAuthenticated],
  )

  /**
   * Track challenge outcome tasks after BOTH users have completed
   * Should be called only after both participants have completed their parts
   *
   * @param {Object} params - Challenge outcome parameters
   * @param {string} params.challengeId - The ID of the completed challenge
   * @param {string} params.winnerUserId - User ID of the winner
   * @param {string} params.loserUserId - User ID of the loser
   * @param {boolean} params.isTie - Whether the challenge ended in a tie
   */
  const trackChallengeOutcome = useCallback(
    async params => {
      if (!DAILY_TASKS_ENABLED) {
        return
      }

      try {
        const { winnerUserId, loserUserId, isTie } = params

        if (!currentUserId) {
          return
        }

        // Only proceed if current user is part of this challenge
        if (currentUserId !== winnerUserId && currentUserId !== loserUserId) {
          console.log(
            'Current user not part of this challenge, skipping outcome tracking',
          )
          return
        }

        // If user is the winner and it's not a tie, update win-related tasks
        if (currentUserId === winnerUserId && !isTie) {
          // Update win challenges task
          await dispatch(
            updateTaskProgress({
              taskType: 'WIN_CHALLENGES',
            }),
          ).unwrap()

          // Update win streak task
          await dispatch(
            updateTaskProgress({
              taskType: 'MAINTAIN_WINSTREAK',
            }),
          ).unwrap()

          console.log('Successfully tracked win-related task progress')
        }

        console.log('Challenge outcome tracking completed')
      } catch (error) {
        console.error('Error tracking challenge outcome:', error)
      }
    },
    [dispatch, currentUserId],
  )

  /**
   * Track when a user views a challenge analysis
   */
  const trackAnalysisView = useCallback(async () => {
    if (!DAILY_TASKS_ENABLED) {
      return
    }

    try {
      await dispatch(
        updateTaskProgress({
          taskType: 'VIEW_ANALYSES',
        }),
      ).unwrap()
    } catch (error) {
      console.error('Error tracking analysis view:', error)
    }
  }, [dispatch])

  /**
   * Track when a user challenges a friend
   */
  const trackFriendChallenge = useCallback(async () => {
    if (!DAILY_TASKS_ENABLED) {
      return
    }

    try {
      await dispatch(
        updateTaskProgress({
          taskType: 'CHALLENGE_FRIEND',
        }),
      ).unwrap()
    } catch (error) {
      console.error('Error tracking friend challenge:', error)
    }
  }, [dispatch])

  /**
   * Direct update of a task's progress
   */
  const updateTaskProgressDirect = useCallback(
    async (taskType, incrementBy = 1) => {
      if (!DAILY_TASKS_ENABLED) {
        return null
      }

      try {
        return await dispatch(
          updateTaskProgress({
            taskType,
            incrementBy,
          }),
        ).unwrap()
      } catch (error) {
        console.error(`Error updating ${taskType} task progress:`, error)
        return null
      }
    },
    [dispatch],
  )

  /**
   * Calculate progress summary
   */
  const getProgressSummary = useCallback(() => {
    const completedTasks = tasks.filter(task => task.completed).length
    const totalTasks = tasks.length
    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const unclaimedRewards = tasks.filter(
      task => task.completed && !task.rewardClaimed,
    ).length

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: progressPercentage,
      unclaimedRewards,
    }
  }, [tasks])

  return {
    // State
    tasks: DAILY_TASKS_ENABLED ? tasks : [],
    tasksLoading: DAILY_TASKS_ENABLED ? tasksLoading : false,
    tasksError: DAILY_TASKS_ENABLED ? tasksError : null,
    justCompletedTaskId: DAILY_TASKS_ENABLED ? justCompletedTaskId : null,
    lastClaimedReward: DAILY_TASKS_ENABLED ? lastClaimedReward : null,
    statistics: DAILY_TASKS_ENABLED ? statistics : {},
    statisticsLoading: DAILY_TASKS_ENABLED ? statisticsLoading : false,

    // Derived data
    progressSummary: getProgressSummary(),

    // Actions
    fetchTasks: () =>
      DAILY_TASKS_ENABLED ? dispatch(fetchDailyTasks()) : Promise.resolve([]),
    fetchStatistics: () =>
      DAILY_TASKS_ENABLED
        ? dispatch(fetchTaskStatistics())
        : Promise.resolve({}),
    trackChallengeCompletion,
    trackChallengeOutcome,
    trackAnalysisView,
    trackFriendChallenge,
    updateTaskProgress: updateTaskProgressDirect,
  }
}

export default useDailyTasks

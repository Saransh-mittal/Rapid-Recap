// components/quickClashComponents/dailyTasks/TaskCompletionHandler.jsx
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Portal } from '@chakra-ui/react'
import { clearJustCompletedTask } from '../../../redux/quickClashDailyTasksSlice'
import TaskCompletionAnimation from './TaskCompletionAnimation'

/**
 * This component handles the global task completion animation
 * It monitors Redux state for newly completed tasks and renders
 * the animation at the app level, independent of any other components
 *
 * Uses a Portal to ensure the animation appears above all other UI elements,
 * including modals.
 */
const TaskCompletionHandler = () => {
  const dispatch = useDispatch()
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false)
  const [completedTaskAnimation, setCompletedTaskAnimation] = useState(null)

  // Get state from Redux store
  const { tasks, justCompletedTaskId } = useSelector(
    state => state.quickClashDailyTasks,
  )

  // Show completion animation when a task is completed
  useEffect(() => {
    if (justCompletedTaskId) {
      const completedTask = tasks.find(task => task._id === justCompletedTaskId)
      if (completedTask) {
        setCompletedTaskAnimation(completedTask)
        setShowCompletionAnimation(true)
      }

      // Clear the "just completed" task after a delay
      const timer = setTimeout(() => {
        dispatch(clearJustCompletedTask())
      }, 4500) // Wait a bit longer for animation completion

      return () => clearTimeout(timer)
    }
  }, [justCompletedTaskId, tasks, dispatch])

  // Handle animation completion
  const handleAnimationComplete = () => {
    setShowCompletionAnimation(false)
  }

  // Only render the animation component when needed
  if (!showCompletionAnimation || !completedTaskAnimation) {
    return null
  }

  // Use Portal to render the animation at the end of the DOM tree
  // This ensures it appears above all other UI components, including modals
  return (
    <Portal>
      <TaskCompletionAnimation
        taskTitle={completedTaskAnimation.title}
        level={completedTaskAnimation.difficulty}
        onComplete={handleAnimationComplete}
      />
    </Portal>
  )
}

export default TaskCompletionHandler

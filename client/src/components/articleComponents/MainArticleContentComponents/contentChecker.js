import { boldNumberedChecker } from './checkers/boldNumberedChecker'
import { consecutiveNumberedChecker } from './checkers/consecutiveNumberedChecker'
import { stepsNumberedChecker } from './checkers/stepsNumberedChecker'

export const defaultCheckers = [
  boldNumberedChecker,
  consecutiveNumberedChecker,
  stepsNumberedChecker,
]

export const checkContent = (text, checkers = defaultCheckers) => {
  // Sort checkers by priority
  const sortedCheckers = [...checkers].sort((a, b) => a.priority - b.priority)

  // Try each checker in priority order
  for (const checker of sortedCheckers) {
    const result = checker.check(text)
    if (result) {
      return result
    }
  }

  // If no checker matches, return the entire text as a single part
  return [
    {
      type: 'text',
      content: text,
    },
  ]
}

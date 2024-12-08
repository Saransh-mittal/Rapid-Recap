// checkers/stepsNumberedChecker.js
export const stepsNumberedChecker = {
  priority: 3,
  check: text => {
    const parts = []
    let currentPosition = 0
    let foundNumbers = false

    // First find if we have a steps introduction
    const stepsIntroIndex = text.toLowerCase().indexOf('steps:')
    if (stepsIntroIndex === -1) {
      return null
    }

    // Add text before steps section
    if (stepsIntroIndex > 0) {
      parts.push({
        type: 'text',
        content: text.slice(0, stepsIntroIndex).trim(),
        position: {
          start: 0,
          end: stepsIntroIndex,
        },
      })
    }

    // Find the steps section
    const textAfterIntro = text.slice(stepsIntroIndex)

    // Look for complete steps with their content
    // This pattern requires actual content after the number
    const stepPattern = /(\d+)\.\s+([A-Za-z].*?)(?=(?:\s+\d+\.|$))/g
    let lastEnd = stepsIntroIndex
    let match

    while ((match = stepPattern.exec(textAfterIntro)) !== null) {
      const [fullMatch, number, content] = match
      const absoluteIndex = stepsIntroIndex + match.index

      // Add any text between steps
      if (absoluteIndex > lastEnd) {
        parts.push({
          type: 'text',
          content: text.slice(lastEnd, absoluteIndex).trim(),
          position: {
            start: lastEnd,
            end: absoluteIndex,
          },
        })
      }

      // Add the numbered step
      parts.push({
        type: 'numbered',
        number: number,
        content: content.trim(),
        position: {
          start: absoluteIndex,
          end: absoluteIndex + fullMatch.length,
        },
      })

      lastEnd = absoluteIndex + fullMatch.length
      foundNumbers = true
    }

    // Add remaining text
    if (lastEnd < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastEnd).trim(),
        position: {
          start: lastEnd,
          end: text.length,
        },
      })
    }

    return foundNumbers ? parts : null
  },
}

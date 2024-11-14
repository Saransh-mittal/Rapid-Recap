export const consecutiveNumberedChecker = {
  priority: 2,
  check: text => {
    if (!text) return null
    const instructionalPattern =
      /(?!(?:19|20)\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b(\d{1,2})\.\s+([^.\n]+(?:\.[^.\n\d]+)*)/g
    const parts = []
    let lastIndex = 0
    let previousNumber = 0
    let hasConsecutiveNumbers = false
    let matches = [...text.matchAll(instructionalPattern)]

    matches.forEach((match, index) => {
      const [fullMatch, number, content] = match
      const currentNumber = parseInt(number)

      if (index === 0 || currentNumber === previousNumber + 1) {
        if (index === 1) hasConsecutiveNumbers = true

        const matchIndex = match.index || 0

        if (matchIndex > lastIndex) {
          parts.push({
            type: 'text',
            content: text.slice(lastIndex, matchIndex),
          })
        }

        if (hasConsecutiveNumbers || index === 0) {
          parts.push({
            type: 'numbered',
            number: currentNumber.toString(),
            content: content.trim(),
          })
        }

        lastIndex = matchIndex + fullMatch.length
      }

      previousNumber = currentNumber
    })

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      })
    }

    return hasConsecutiveNumbers && parts.length > 2 ? parts : null
  },
}

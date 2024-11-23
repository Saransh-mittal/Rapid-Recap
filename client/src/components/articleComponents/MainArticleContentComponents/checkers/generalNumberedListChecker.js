export const generalNumberedListChecker = {
  priority: 4,
  check: text => {
    // Match numbered items that have bold titles followed by descriptions
    // Format: number. **Title** description; or number. **Title** description.
    const numberedPattern = /(\d+)\.\s+\*\*([^*]+)\*\*([^;.]*(?:;|\.))/g

    // First check if we have any matches
    const hasMatches = text.match(numberedPattern)
    if (!hasMatches) {
      return null
    }

    const parts = []
    let lastIndex = 0
    let match

    // Find the starting position of the first number to separate initial text
    const firstNumberIndex = text.search(/\d+\.\s+\*\*/)
    if (firstNumberIndex > 0) {
      parts.push({
        type: 'text',
        content: text.slice(0, firstNumberIndex).trim(),
      })
    }

    // Process each numbered item
    while ((match = numberedPattern.exec(text)) !== null) {
      const [fullMatch, number, title, description] = match
      const startIndex = match.index

      // Add any text between numbered items
      if (startIndex > lastIndex && lastIndex !== 0) {
        const betweenText = text.slice(lastIndex, startIndex).trim()
        if (betweenText && !betweenText.match(/^[,;.\s]+$/)) {
          parts.push({
            type: 'text',
            content: betweenText,
          })
        }
      }

      // Add the numbered item
      parts.push({
        type: 'numbered',
        number: number,
        content: `**${title}**${description.trim()}`,
      })

      lastIndex = startIndex + fullMatch.length
    }

    // Add any remaining text after the last numbered item
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex).trim()
      if (remainingText && !remainingText.match(/^[,;.\s]+$/)) {
        parts.push({
          type: 'text',
          content: remainingText,
        })
      }
    }

    return parts
  },
}

export const boldNumberedChecker = {
  priority: 1,
  check: text => {
    const boldPattern =
      /(?:\*\*(?!(?:19|20)\d{2})\d{1,2}\*\*|(?!(?:19|20)\d{2})\d{1,2})\.\s+\*\*[^*]+\*\*\s*-[^.]+\./g
    const boldMatches = text?.match(boldPattern)

    if (!boldMatches?.length) {
      return null
    }

    const parts = []
    let lastIndex = 0

    boldMatches.forEach(match => {
      const cleanMatch = match.trimLeft()
      const index = text.indexOf(cleanMatch, lastIndex)

      if (index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, index),
        })
      }

      const numberMatch = cleanMatch.match(/\d+/)
      const number = numberMatch ? numberMatch[0] : ''
      let content

      if (cleanMatch.startsWith('**')) {
        content = cleanMatch.replace(/^\*\*\d+\.\s+/, '').replace(/\*\*$/, '')
      } else {
        content = cleanMatch.replace(/^\d+\.\s+/, '').replace(/\.$/, '')
      }

      parts.push({
        type: 'numbered',
        number,
        content,
      })

      lastIndex = index + match.length
    })

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      })
    }

    return parts
  },
}

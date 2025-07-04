// utils/hindiText.utils.js - Utility for proper Hindi text segmentation and Word Weaver support

/**
 * Segments Hindi text into meaningful units (letter+matra combinations)
 * This treats combined characters (consonant + matra) as single units
 * for better Word Weaver gameplay experience
 */
const segmentHindiText = hindiText => {
  if (!hindiText || typeof hindiText !== 'string') {
    return []
  }

  // Remove spaces and clean the text
  const cleanText = hindiText.replace(/\s+/g, '').trim()

  // Use Intl.Segmenter for proper grapheme segmentation (if available)
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' })
      const segments = Array.from(segmenter.segment(cleanText))
      return segments.map(seg => seg.segment)
    } catch (error) {
      console.warn('Intl.Segmenter not available, using fallback method')
    }
  }

  // Fallback method: Manual Hindi text segmentation
  return segmentHindiFallback(cleanText)
}

/**
 * Fallback method for Hindi text segmentation
 * Groups base characters with their associated matras and other combining marks
 */
const segmentHindiFallback = text => {
  const segments = []
  let currentSegment = ''

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const charCode = char.codePointAt(0)

    // Check if current character is a combining mark (matra, etc.)
    const isCombiningMark =
      (charCode >= 0x0900 && charCode <= 0x0903) || // Devanagari combining marks
      (charCode >= 0x093a && charCode <= 0x093c) || // More combining marks
      (charCode >= 0x093e && charCode <= 0x094f) || // Dependent vowel signs (matras)
      (charCode >= 0x0951 && charCode <= 0x0957) || // Additional marks
      charCode === 0x094d || // Virama (halant)
      charCode === 0x0962 ||
      charCode === 0x0963 // Vocalic marks

    if (isCombiningMark && currentSegment) {
      // Add combining mark to current segment
      currentSegment += char
    } else {
      // Start new segment if we have a complete previous segment
      if (currentSegment) {
        segments.push(currentSegment)
      }
      currentSegment = char
    }
  }

  // Add the last segment
  if (currentSegment) {
    segments.push(currentSegment)
  }

  return segments
}

/**
 * ENHANCED: Gets diverse confusing Hindi units with various matras
 * @param {Array} correctUnits - The correct units from the answer
 * @returns {Array} - Array of confusing Hindi units with matras
 */
const getConfusingHindiUnits = correctUnits => {
  // Enhanced collection of Hindi units with diverse matra combinations
  const diverseHindiUnits = [
    // Basic consonants
    'क',
    'ख',
    'ग',
    'घ',
    'च',
    'छ',
    'ज',
    'झ',
    'ट',
    'ठ',
    'ड',
    'ढ',
    'त',
    'थ',
    'd',
    'ध',
    'न',
    'प',
    'फ',
    'ब',
    'भ',
    'म',
    'य',
    'र',
    'ल',
    'व',
    'श',
    'ष',
    'स',
    'ह',

    // Common consonant + matra combinations for confusion
    'का',
    'की',
    'कू',
    'के',
    'कै',
    'को',
    'कौ',
    'कं',
    'कः',
    'रा',
    'री',
    'रू',
    'रे',
    'रै',
    'रो',
    'रौ',
    'रं',
    'रः',
    'ना',
    'नी',
    'नू',
    'ने',
    'नै',
    'नो',
    'नौ',
    'नं',
    'नः',
    'मा',
    'मी',
    'मू',
    'मे',
    'मै',
    'मो',
    'मौ',
    'मं',
    'मः',
    'सा',
    'सी',
    'सू',
    'से',
    'सै',
    'सो',
    'सौ',
    'सं',
    'सः',
    'ता',
    'ती',
    'तू',
    'ते',
    'तै',
    'तो',
    'तौ',
    'तं',
    'तः',
    'दा',
    'दी',
    'दू',
    'दे',
    'दै',
    'दो',
    'दौ',
    'दं',
    'दः',
    'पा',
    'पी',
    'पू',
    'पे',
    'पै',
    'पो',
    'पौ',
    'पं',
    'पः',
    'बा',
    'बी',
    'बू',
    'बे',
    'बै',
    'बो',
    'बौ',
    'बं',
    'बः',
    'ला',
    'ली',
    'लू',
    'ले',
    'लै',
    'लो',
    'लौ',
    'लं',
    'लः',
    'वा',
    'वी',
    'वू',
    'वे',
    'वै',
    'वो',
    'वौ',
    'वं',
    'वः',
    'हा',
    'ही',
    'हू',
    'हे',
    'है',
    'हो',
    'हौ',
    'हं',
    'हः',

    // Complex combinations with conjuncts and special characters
    'क्ष',
    'त्र',
    'ज्ञ',
    'श्र',
    'क्त',
    'स्त',
    'न्त',
    'म्प',
    'ड़',
    'ढ़',
    'क्षा',
    'त्रा',
    'ज्ञा',
    'श्रा',
    'क्ता',
    'स्ता',
    'न्ता',
    'म्पा',
    'क्षी',
    'त्री',
    'ज्ञी',
    'श्री',
    'क्ती',
    'स्ती',
    'न्ती',
    'म्पी',

    // Vowels and vowel signs for additional confusion
    'अ',
    'आ',
    'इ',
    'ई',
    'उ',
    'ऊ',
    'ए',
    'ऐ',
    'ओ',
    'औ',
    'अं',
    'अः',

    // Numerals in Devanagari (can be confusing)
    '०',
    '१',
    '२',
    '३',
    '४',
    '५',
    '६',
    '७',
    '८',
    '९',
  ]

  // Filter out units that are already in the correct answer to avoid making it too easy
  const availableUnits = diverseHindiUnits.filter(unit => {
    // Check if this unit or similar units are not already in the correct answer
    return !correctUnits.some(
      correctUnit =>
        correctUnit === unit ||
        correctUnit.includes(unit) ||
        unit.includes(correctUnit),
    )
  })

  return availableUnits
}

/**
 * ENHANCED: Generates shuffled units for Hindi Word Weaver with better confusing extra units
 * @param {string} hindiAnswer - The correct Hindi answer
 * @param {Object} options - Configuration options
 * @returns {Object} - Object containing shuffled units and metadata
 */
const generateHindiWordWeaverUnits = (hindiAnswer, options = {}) => {
  const {
    addExtraUnits = false,
    extraUnitsCount = 0,
    language = 'hi',
  } = options

  if (!hindiAnswer || typeof hindiAnswer !== 'string') {
    throw new Error('Invalid Hindi answer provided')
  }

  // Segment the Hindi answer into meaningful units
  const correctUnits = segmentHindiText(hindiAnswer)

  if (correctUnits.length === 0) {
    throw new Error('Could not segment Hindi text into units')
  }

  // Calculate actual word length (number of units, not characters)
  const wordLength = correctUnits.length

  // Prepare extra Hindi units if needed
  let allUnits = [...correctUnits]

  if (addExtraUnits && extraUnitsCount > 0) {
    // ENHANCED: Get diverse confusing Hindi units
    const availableExtraUnits = getConfusingHindiUnits(correctUnits)

    // ENHANCED: Intelligent selection of extra units for maximum confusion
    const selectedExtraUnits = []

    // Prioritize units with matras and conjuncts for more confusion
    const priorityUnits = availableExtraUnits.filter(
      unit =>
        unit.length > 1 || // Units with matras or conjuncts
        ['क्ष', 'त्र', 'ज्ञ', 'श्र'].includes(unit) || // Special conjuncts
        /[ाीूेैोौंः]/.test(unit), // Units containing matras
    )

    const regularUnits = availableExtraUnits.filter(
      unit => !priorityUnits.includes(unit),
    )

    // First, try to add priority units (more confusing)
    let priorityCount = Math.min(
      priorityUnits.length,
      Math.ceil(extraUnitsCount * 0.7),
    )
    for (let i = 0; i < priorityCount && priorityUnits.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * priorityUnits.length)
      const selectedUnit = priorityUnits.splice(randomIndex, 1)[0]
      selectedExtraUnits.push(selectedUnit)
    }

    // Then add regular units to fill remaining slots
    let remainingCount = extraUnitsCount - selectedExtraUnits.length
    for (let i = 0; i < remainingCount && regularUnits.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * regularUnits.length)
      const selectedUnit = regularUnits.splice(randomIndex, 1)[0]
      selectedExtraUnits.push(selectedUnit)
    }

    allUnits = [...correctUnits, ...selectedExtraUnits]

    console.log('Enhanced Hindi Word Weaver confusion units:', {
      correctUnits,
      selectedExtraUnits,
      totalUnits: allUnits.length,
      confusionLevel: selectedExtraUnits.filter(unit => unit.length > 1).length,
    })
  }

  // ENHANCED: Better shuffling algorithm for maximum confusion
  const shuffledUnits = allUnits.sort(() => Math.random() - 0.5)

  // Additional shuffle for better randomization
  for (let i = shuffledUnits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledUnits[i], shuffledUnits[j]] = [shuffledUnits[j], shuffledUnits[i]]
  }

  return {
    shuffledUnits,
    wordLength,
    correctUnits,
    totalUnitsCount: shuffledUnits.length,
    extraUnitsAdded: addExtraUnits ? allUnits.length - correctUnits.length : 0,
    isHindi: true,
    confusionLevel: addExtraUnits ? 'high' : 'normal',
  }
}

/**
 * Validates if a Hindi word answer matches the correct answer
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @returns {boolean} - Whether the answers match
 */
const validateHindiWordAnswer = (userAnswer, correctAnswer) => {
  if (!userAnswer || !correctAnswer) {
    return false
  }

  // Normalize both answers (remove spaces, convert to consistent case)
  const normalizeHindi = text => {
    return text.replace(/\s+/g, '').trim()
  }

  const normalizedUser = normalizeHindi(userAnswer)
  const normalizedCorrect = normalizeHindi(correctAnswer)

  return normalizedUser === normalizedCorrect
}

/**
 * Gets the display length for Hindi text (number of visual units)
 * @param {string} hindiText - Hindi text to measure
 * @returns {number} - Number of visual units
 */
const getHindiDisplayLength = hindiText => {
  return segmentHindiText(hindiText).length
}

/**
 * Checks if text contains Hindi characters
 * @param {string} text - Text to check
 * @returns {boolean} - Whether text contains Hindi characters
 */
const containsHindi = text => {
  if (!text || typeof text !== 'string') {
    return false
  }

  // Check for Devanagari script range (used for Hindi)
  const devanagariRange = /[\u0900-\u097F]/
  return devanagariRange.test(text)
}

module.exports = {
  segmentHindiText,
  generateHindiWordWeaverUnits,
  validateHindiWordAnswer,
  getHindiDisplayLength,
  containsHindi,
  segmentHindiFallback,
}

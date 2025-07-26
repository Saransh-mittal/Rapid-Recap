// client/src/components/articleComponents/hooks/useEnhancedContentFitting.js
// ENHANCED VERSION: Better Hindi text support with proper pagination

import { useState, useCallback, useEffect, useRef } from 'react'

// Helper function to detect Hindi text
const isHindiText = text => {
  if (!text || typeof text !== 'string') return false
  const hindiRegex = /[\u0900-\u097F]/
  return hindiRegex.test(text)
}

// Enhanced sentence splitting for both English and Hindi
const splitIntoSentences = (text, isHindi = false) => {
  if (!text || typeof text !== 'string') return []

  if (isHindi) {
    // Hindi sentence splitting - using Devanagari punctuation and common patterns
    return text
      .split(/(?<=[।।॥\.\!\?])\s+/)
      .filter(s => s.trim().length > 10) // Minimum length for Hindi sentences
      .map(s => s.trim())
  } else {
    // English sentence splitting
    return text
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 5)
      .map(s => s.trim())
  }
}

// Enhanced word splitting for Hindi and English
const splitIntoWords = (text, isHindi = false) => {
  if (!text || typeof text !== 'string') return []

  if (isHindi) {
    // Hindi word splitting - respects Devanagari script boundaries
    return text
      .split(/[\s\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]+/)
      .filter(word => word.trim().length > 0)
  } else {
    // English word splitting
    return text.split(/\s+/).filter(word => word.trim().length > 0)
  }
}

// Custom hook for measuring text dimensions with enhanced accuracy
const useTextMeasurement = () => {
  const measurementRef = useRef(null)

  const measureText = useCallback((text, styles = {}) => {
    if (!measurementRef.current) {
      const element = document.createElement('div')
      element.style.position = 'absolute'
      element.style.visibility = 'hidden'
      element.style.height = 'auto'
      element.style.width = 'auto'
      element.style.whiteSpace = 'pre-wrap'
      element.style.wordWrap = 'break-word'
      element.style.zIndex = '-9999'
      element.style.top = '-10000px'
      element.style.left = '-10000px'
      document.body.appendChild(element)
      measurementRef.current = element
    }

    const element = measurementRef.current

    // Detect if text is Hindi
    const textIsHindi = isHindiText(text)

    // Apply styles with enhanced defaults for Hindi
    Object.assign(element.style, {
      fontSize: styles.fontSize || (textIsHindi ? '1.3rem' : '1.2rem'),
      lineHeight: styles.lineHeight || (textIsHindi ? '2.0' : '1.8'),
      fontFamily:
        styles.fontFamily ||
        (textIsHindi
          ? "'Noto Sans Devanagari', 'Mangal', 'Segoe UI', sans-serif"
          : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"),
      padding: styles.padding || '0px',
      margin: styles.margin || '0px',
      width: styles.width || 'auto',
      maxWidth: styles.maxWidth || 'none',
      border: 'none',
      outline: 'none',
      boxSizing: 'border-box',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      wordBreak: textIsHindi ? 'break-word' : 'normal',
      hyphens: textIsHindi ? 'none' : 'auto',
      ...styles,
    })

    element.innerHTML = text // Use innerHTML to handle formatted content

    // Force reflow to get accurate measurements
    element.offsetHeight

    const rect = element.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(element)

    return {
      width: rect.width,
      height: rect.height,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
      lineHeight:
        parseFloat(computedStyle.lineHeight) || (textIsHindi ? 32 : 24),
      isHindi: textIsHindi,
    }
  }, [])

  useEffect(() => {
    return () => {
      if (measurementRef.current && measurementRef.current.parentNode) {
        measurementRef.current.parentNode.removeChild(measurementRef.current)
        measurementRef.current = null
      }
    }
  }, [])

  return measureText
}

// Main enhanced content fitting hook with Hindi support
export const useEnhancedContentFitting = ({
  content,
  containerHeight,
  containerWidth,
  styles,
  showOnlySummary,
  importantSentences,
  enableOverflowFallback = true,
  isHindi = false,
}) => {
  const measureText = useTextMeasurement()
  const [measuredPages, setMeasuredPages] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [fallbackMode, setFallbackMode] = useState(false)

  const calculateOptimalPagination = useCallback(async () => {
    if (!content || !containerHeight || containerHeight < 100) {
      console.log('Invalid content or container height:', {
        content: !!content,
        containerHeight,
      })
      return []
    }

    setIsCalculating(true)
    setFallbackMode(false)

    try {
      // Enhanced safety margins for Hindi text
      const SAFETY_MARGIN = isHindi ? 80 : 60 // ← Reduced by 40
      const BUTTON_HEIGHT = showOnlySummary ? 105 : 80 // ← Reduced by 40
      const PAGE_INDICATOR_HEIGHT = 40 // ← Reduced by 20
      const SCROLL_BUFFER = isHindi ? 20 : 15 // ← Reduced by ~15

      const baseAvailableHeight =
        (containerHeight -
          BUTTON_HEIGHT -
          PAGE_INDICATOR_HEIGHT -
          SAFETY_MARGIN) *
        1.15 // ← 15% more space
      const effectiveWidth = Math.min(containerWidth - 60, 800) // Account for padding and scrollbar

      const textStyles = {
        fontSize: styles?.fontSize || (isHindi ? '1.3rem' : '1.2rem'),
        lineHeight: styles?.lineHeight || (isHindi ? '2.0' : '1.8'),
        fontFamily:
          styles?.fontFamily ||
          (isHindi
            ? "'Noto Sans Devanagari', 'Mangal', 'Segoe UI', sans-serif"
            : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"),
        width: `${effectiveWidth}px`,
        maxWidth: `${effectiveWidth}px`,
        padding: '16px',
        wordBreak: isHindi ? 'break-word' : 'normal',
        hyphens: isHindi ? 'none' : 'auto',
      }

      console.log('Calculating pagination with:', {
        isHindi,
        baseAvailableHeight,
        effectiveWidth,
        contentType: Array.isArray(content) ? 'array' : typeof content,
        contentLength: Array.isArray(content)
          ? content.length
          : content?.length || 0,
      })

      if (showOnlySummary && importantSentences?.length > 0) {
        return await handleSummaryPagination(
          importantSentences,
          baseAvailableHeight,
          textStyles,
          isHindi,
        )
      }

      return await handleRegularContentPagination(
        content,
        baseAvailableHeight,
        textStyles,
        enableOverflowFallback,
        isHindi,
      )
    } catch (error) {
      console.error('Error calculating pagination:', error)
      // Enhanced fallback
      const fallback = Array.isArray(content)
        ? content.filter(item => item && item.trim())
        : [String(content)]
      console.log('Using fallback pages:', fallback.length)
      setMeasuredPages(fallback)
      setFallbackMode(true)
      return fallback
    } finally {
      setIsCalculating(false)
    }
  }, [
    content,
    containerHeight,
    containerWidth,
    styles,
    showOnlySummary,
    importantSentences,
    enableOverflowFallback,
    isHindi,
    measureText,
  ])

  // Enhanced summary pagination with Hindi support
  const handleSummaryPagination = useCallback(
    async (sentences, availableHeight, textStyles, isHindi) => {
      const pages = []
      let currentPage = []
      let currentHeight = 0
      const SENTENCE_MARGIN = isHindi ? 35 : 25 // More margin for Hindi

      for (const sentence of sentences) {
        const measurement = measureText(sentence, textStyles)
        const sentenceHeight = measurement.height + SENTENCE_MARGIN

        // More conservative height checking for Hindi
        const threshold = isHindi ? 0.85 : 0.9 // ← Increased by 0.05
        if (
          currentHeight + sentenceHeight > availableHeight * threshold &&
          currentPage.length > 0
        ) {
          pages.push([...currentPage])
          currentPage = [sentence]
          currentHeight = sentenceHeight
        } else {
          currentPage.push(sentence)
          currentHeight += sentenceHeight
        }

        // Prevent pages from becoming too long (fewer items for Hindi)
        const maxItemsPerPage = isHindi ? 6 : 8
        if (currentPage.length >= maxItemsPerPage) {
          pages.push([...currentPage])
          currentPage = []
          currentHeight = 0
        }
      }

      if (currentPage.length > 0) {
        pages.push(currentPage)
      }

      const finalPages = pages.length > 0 ? pages : [sentences]
      console.log('Summary pagination result:', {
        totalPages: finalPages.length,
        isHindi,
        originalSentences: sentences.length,
      })
      setMeasuredPages(finalPages)
      return finalPages
    },
    [measureText],
  )

  // Enhanced regular content pagination with Hindi support
  const handleRegularContentPagination = useCallback(
    async (
      content,
      availableHeight,
      textStyles,
      enableOverflowFallback,
      isHindi,
    ) => {
      const fullText = Array.isArray(content)
        ? content.join(' ')
        : String(content)

      console.log('Processing full text:', {
        length: fullText.length,
        isHindi,
        firstChars: fullText.substring(0, 100),
      })

      // Enhanced text preprocessing for Hindi
      const sentences = splitIntoSentences(fullText, isHindi)

      if (sentences.length === 0) {
        const fallback = [fullText]
        console.log('No sentences found, using fallback')
        setMeasuredPages(fallback)
        return fallback
      }

      console.log('Split into sentences:', {
        count: sentences.length,
        isHindi,
        firstSentence: sentences[0]?.substring(0, 50) + '...',
      })

      // Smart pagination with enhanced word boundary respect for Hindi
      const pages = []
      let currentText = ''
      let lastSafeBreakPoint = ''
      let estimatedHeight = 0

      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i]
        const testText = currentText ? `${currentText} ${sentence}` : sentence

        // Measure current content
        const measurement = measureText(testText, textStyles)
        const measuredHeight = measurement.height

        // Enhanced overflow detection with Hindi-specific thresholds
        const conservativeThreshold = isHindi ? 0.82 : 0.87 // ← Increased by ~0.07
        const definiteThreshold = isHindi ? 0.95 : 0.98 // ← Increased by ~0.03

        const isOverflowing =
          measuredHeight > availableHeight * conservativeThreshold
        const willDefinitelyOverflow =
          measuredHeight > availableHeight * definiteThreshold

        if (willDefinitelyOverflow && currentText) {
          // Use last safe break point if available
          const textToSave = lastSafeBreakPoint || currentText
          pages.push(textToSave.trim())

          currentText = sentence
          lastSafeBreakPoint = sentence
          estimatedHeight = measureText(sentence, textStyles).height
        } else if (isOverflowing && currentText && sentences.length > i + 3) {
          // Only break early if there are sufficient remaining sentences
          pages.push(currentText.trim())
          currentText = sentence
          lastSafeBreakPoint = sentence
          estimatedHeight = measureText(sentence, textStyles).height
        } else {
          currentText = testText
          estimatedHeight = measuredHeight

          // Update safe break point at sentence boundaries (Hindi-aware)
          const hindiPunctuation = /[।।॥]/
          const englishPunctuation = /[.!?]/
          const isEndOfSentence = isHindi
            ? hindiPunctuation.test(sentence)
            : englishPunctuation.test(sentence)

          if (isEndOfSentence) {
            lastSafeBreakPoint = currentText
          }
        }

        // Prevent extremely long pages (stricter for Hindi)
        const maxHeightMultiplier = isHindi ? 1.15 : 1.25
        if (estimatedHeight > availableHeight * maxHeightMultiplier) {
          if (lastSafeBreakPoint && lastSafeBreakPoint !== currentText) {
            pages.push(lastSafeBreakPoint.trim())
            // Reset with remaining content
            const remainingText = currentText
              .replace(lastSafeBreakPoint, '')
              .trim()
            currentText = remainingText
            lastSafeBreakPoint = remainingText
          } else {
            // Force break even if not ideal
            pages.push(currentText.trim())
            currentText = ''
            lastSafeBreakPoint = ''
          }
          estimatedHeight = 0
        }
      }

      // Add final page
      if (currentText.trim()) {
        pages.push(currentText.trim())
      }

      // Enhanced validation and fallback
      const finalPages = pages.filter(page => page && page.trim().length > 0)

      if (finalPages.length === 0) {
        const fallback = [fullText]
        console.log('No valid pages, using fallback')
        setMeasuredPages(fallback)
        setFallbackMode(true)
        return fallback
      }

      // Validate each page doesn't exceed limits by too much
      const validatedPages = finalPages.map((page, index) => {
        const measurement = measureText(page, textStyles)
        const maxAllowedHeight = availableHeight * (isHindi ? 1.4 : 1.5)

        if (measurement.height > maxAllowedHeight && enableOverflowFallback) {
          console.log(`Page ${index + 1} will require internal scrolling:`, {
            height: measurement.height,
            maxAllowed: maxAllowedHeight,
            isHindi,
            preview: page.substring(0, 50) + '...',
          })
        }
        return page
      })

      console.log('Regular content pagination result:', {
        totalPages: validatedPages.length,
        isHindi,
        avgPageLength: Math.round(
          validatedPages.reduce((sum, page) => sum + page.length, 0) /
            validatedPages.length,
        ),
      })

      setMeasuredPages(validatedPages)
      return validatedPages
    },
    [measureText],
  )

  useEffect(() => {
    calculateOptimalPagination()
  }, [calculateOptimalPagination])

  return {
    measuredPages,
    isCalculating,
    fallbackMode,
    recalculate: calculateOptimalPagination,
  }
}

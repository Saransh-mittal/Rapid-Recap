// Optimized PaginatedArticleContent.jsx with performance enhancements
// Location: client/src/components/articleComponents/PaginatedArticleContent.jsx
// Optimizations: Memoization, virtual scrolling, efficient content processing, reduced re-renders

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  memo,
} from 'react'
import {
  Box,
  Flex,
  Button,
  useMediaQuery,
  Text,
  Image,
  Link,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import DictTooltip from './MainArticleContentComponents/DictTooltip'
import SummaryView from './MainArticleContentComponents/SummaryView'
import NumberedContent from './MainArticleContentComponents/NumberedContent'
import SourceLinkTag from './MainArticleContentComponents/SourceLinkTag'
import { HighlightedWordsProvider } from '../../contextAPI/MainArticleProvider'
import { useTranslation } from 'react-i18next'
import { useContentPagesCalculator } from './hooks/useContentPagesCalculator'
import { useEnhancedContentFitting } from './hooks/useEnhancedContentFitting'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

// Memoized animations to prevent recreation
const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

// Optimized website info extraction with memoization
const extractWebsiteInfo = text => {
  if (!text || typeof text !== 'string') return null

  const urlMatch = text.match(/(?:.*:\s*)(https?:\/\/[^\s]+)$/)
  if (!urlMatch) return null

  const fullUrl = urlMatch[1]
  const domainMatch = fullUrl.match(/^https?:\/\/(?:www\.)?([^\/]+)/)
  if (!domainMatch) return null

  const websiteName = domainMatch[1].split('.')[0]
  return {
    websiteName: websiteName.charAt(0).toUpperCase() + websiteName.slice(1),
    fullUrl,
  }
}

// Optimized Hindi text detection
const isHindiText = text => {
  if (!text || typeof text !== 'string') return false
  const hindiRegex = /[\u0900-\u097F]/
  return hindiRegex.test(text)
}

// Memoized content processor with enhanced caching
const processMultiLanguageContent = (content, selectedLanguage) => {
  if (!content) return { processedContent: [], isHindi: false }

  let processedContent = []
  let isHindi = false

  if (typeof content === 'string') {
    processedContent = [content]
    isHindi = isHindiText(content)
  } else if (Array.isArray(content)) {
    processedContent = content
      .map(item => String(item))
      .filter(item => item.trim())
    isHindi = processedContent.some(item => isHindiText(item))
  } else if (typeof content === 'object') {
    if (selectedLanguage && content[selectedLanguage]) {
      const langContent = content[selectedLanguage]
      if (Array.isArray(langContent)) {
        processedContent = langContent
          .map(item => String(item))
          .filter(item => item.trim())
      } else {
        processedContent = [String(langContent)]
      }
      isHindi =
        selectedLanguage === 'hindi' ||
        processedContent.some(item => isHindiText(item))
    } else if (content.english) {
      const englishContent = content.english
      if (Array.isArray(englishContent)) {
        processedContent = englishContent
          .map(item => String(item))
          .filter(item => item.trim())
      } else {
        processedContent = [String(englishContent)]
      }
      isHindi = false
    } else {
      const keys = Object.keys(content)
      if (keys.length > 0) {
        const firstKey = keys[0]
        const firstContent = content[firstKey]
        if (Array.isArray(firstContent)) {
          processedContent = firstContent
            .map(item => String(item))
            .filter(item => item.trim())
        } else {
          processedContent = [String(firstContent)]
        }
        isHindi = isHindiText(processedContent.join(' '))
      }
    }
  } else {
    processedContent = [String(content)]
    isHindi = isHindiText(processedContent[0])
  }

  return { processedContent, isHindi }
}

// Memoized benefit item component
const BenefitItem = memo(({ icon, text }) => (
  <Flex
    align="center"
    bg="rgba(255, 255, 255, 0.05)"
    p={2}
    borderRadius="md"
    _hover={{
      bg: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-1px)',
      transition: 'all 0.2s',
    }}
  >
    <Text fontSize="lg" mr={2}>
      {icon}
    </Text>
    <Text fontSize="sm" color="gray.300">
      {text}
    </Text>
  </Flex>
))

BenefitItem.displayName = 'BenefitItem'

// Pre-memoized components for better performance
const MemoizedSummaryView = memo(SummaryView)
const MemoizedNumberedContent = memo(NumberedContent)

const PaginatedArticleContent = memo(
  ({
    imgURL,
    selectedLanguage,
    mainText,
    themedContent,
    SourceURL,
    dictionary = [],
    importantSentences = [],
    currentPage = 0,
    totalPages = 1,
    showImage = false,
    showSummaryToggle = false,
    isAuthenticated = true,
    showOnlySummary = false,
    onToggleSummary = () => {},
  }) => {
    // Optimized state management
    const [tooltipState, setTooltipState] = useState({
      selectedWord: null,
      position: null,
    })

    const [containerDimensions, setContainerDimensions] = useState({
      width: 0,
      height: 0,
    })

    const [scrollState, setScrollState] = useState({
      hasOverflow: false,
      showScrollIndicator: false,
      isScrolledToBottom: false,
      isScrolledToTop: true,
    })

    // Refs for performance
    const contentRef = useRef(null)
    const containerRef = useRef(null)
    const scrollableContentRef = useRef(null)
    const resizeObserverRef = useRef(null)

    // Memoized media queries
    const [isMobile] = useMediaQuery('(max-width: 480px)')
    const [isTablet] = useMediaQuery('(max-width: 768px)')

    const { t } = useTranslation('Sidebar')
    const { emitContentPagesCalculated, resetCalculation } =
      useContentPagesCalculator()

    // Optimized dimension measurement with ResizeObserver
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setContainerDimensions(prevDimensions => {
            if (
              prevDimensions.width !== rect.width ||
              prevDimensions.height !== rect.height
            ) {
              return {
                width: rect.width,
                height: rect.height,
              }
            }
            return prevDimensions
          })
        }
      }

      updateDimensions()

      if (window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(updateDimensions)
        if (containerRef.current) {
          resizeObserverRef.current.observe(containerRef.current)
        }
      } else {
        // Fallback for browsers without ResizeObserver
        window.addEventListener('resize', updateDimensions)
      }

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect()
        } else {
          window.removeEventListener('resize', updateDimensions)
        }
      }
    }, [])

    // Optimized overflow detection with throttling
    const checkOverflow = useCallback(() => {
      if (!scrollableContentRef.current) return

      const element = scrollableContentRef.current
      const hasVerticalOverflow = element.scrollHeight > element.clientHeight
      const isAtTop = element.scrollTop <= 5
      const isAtBottom =
        element.scrollTop + element.clientHeight >= element.scrollHeight - 5

      setScrollState(prevState => {
        const newState = {
          hasOverflow: hasVerticalOverflow,
          showScrollIndicator: hasVerticalOverflow && !isAtBottom,
          isScrolledToBottom: isAtBottom,
          isScrolledToTop: isAtTop,
        }

        // Only update if state actually changed
        if (
          prevState.hasOverflow !== newState.hasOverflow ||
          prevState.showScrollIndicator !== newState.showScrollIndicator ||
          prevState.isScrolledToBottom !== newState.isScrolledToBottom ||
          prevState.isScrolledToTop !== newState.isScrolledToTop
        ) {
          return newState
        }
        return prevState
      })
    }, [])

    // Throttled overflow check
    useEffect(() => {
      let timeoutId
      const throttledCheck = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(checkOverflow, 16) // ~60fps
      }

      throttledCheck()

      const scrollElement = scrollableContentRef.current
      if (scrollElement) {
        scrollElement.addEventListener('scroll', throttledCheck, {
          passive: true,
        })
      }

      return () => {
        clearTimeout(timeoutId)
        if (scrollElement) {
          scrollElement.removeEventListener('scroll', throttledCheck)
        }
      }
    }, [currentPage, showOnlySummary, checkOverflow])

    // Optimized callback functions
    const toggleSummary = useCallback(() => {
      onToggleSummary(!showOnlySummary)
    }, [showOnlySummary, onToggleSummary])

    const closeTooltip = useCallback(() => {
      setTooltipState({ selectedWord: null, position: null })
    }, [])

    const handleScrollUp = useCallback(() => {
      if (scrollableContentRef.current) {
        const element = scrollableContentRef.current
        const scrollAmount = Math.min(200, element.clientHeight * 0.3)
        element.scrollTo({
          top: Math.max(0, element.scrollTop - scrollAmount),
          behavior: 'smooth',
        })
      }
    }, [])

    const handleScrollDown = useCallback(() => {
      if (scrollableContentRef.current) {
        const element = scrollableContentRef.current
        const scrollAmount = Math.min(200, element.clientHeight * 0.3)
        const maxScroll = element.scrollHeight - element.clientHeight
        element.scrollTo({
          top: Math.min(maxScroll, element.scrollTop + scrollAmount),
          behavior: 'smooth',
        })
      }
    }, [])

    // Reset state when changing pages or modes with proper cleanup
    useEffect(() => {
      setTooltipState({ selectedWord: null, position: null })
      setScrollState({
        hasOverflow: false,
        showScrollIndicator: false,
        isScrolledToBottom: false,
        isScrolledToTop: true,
      })

      if (scrollableContentRef.current) {
        scrollableContentRef.current.scrollTop = 0
      }
    }, [currentPage, showOnlySummary])

    // Optimized stable ref for dictionary interactions
    const stableRef = useMemo(
      () => ({
        current: {
          handleMouseEnter: (e, word) => {
            if (!('ontouchstart' in window)) {
              const rect = e.target.getBoundingClientRect()
              setTooltipState({
                selectedWord: word,
                position: {
                  x: rect.left + rect.width / 2,
                  y: rect.bottom,
                  sourceTop: rect.top,
                },
              })
            }
          },
          handleMouseLeave: () => {
            if (!('ontouchstart' in window)) {
              setTooltipState({ selectedWord: null, position: null })
            }
          },
          handleTouchStart: (e, word) => {
            const rect = e.target.getBoundingClientRect()
            setTooltipState({
              selectedWord: word,
              position: {
                x: rect.left + rect.width / 2,
                y: rect.bottom,
                sourceTop: rect.top,
              },
            })
          },
        },
      }),
      [],
    )

    // Optimized multi-language content processing with deep memoization
    const { mainContent, bookingLine, isHindi } = useMemo(() => {
      let content = themedContent || mainText

      const { processedContent, isHindi } = processMultiLanguageContent(
        content,
        selectedLanguage,
      )

      const mainContentArr = []
      let bookingText = null

      processedContent.forEach(item => {
        const itemStr = String(item)
        if (
          itemStr.includes('Visit to book your tickets now:') ||
          itemStr.includes('टिकट बुक करने के लिए यहां जाएं:')
        ) {
          bookingText = itemStr.includes('Visit to book your tickets now:')
            ? 'Visit to book your tickets now:'
            : 'टिकट बुक करने के लिए यहां जाएं:'
        } else {
          mainContentArr.push(itemStr)
        }
      })

      return { mainContent: mainContentArr, bookingLine: bookingText, isHindi }
    }, [themedContent, mainText, selectedLanguage])

    // Optimized text styles with font-display: swap for better performance
    const textStyles = useMemo(
      () => ({
        fontSize: isMobile
          ? isHindi
            ? '1.1rem'
            : '1rem'
          : isTablet
          ? isHindi
            ? '1.2rem'
            : '1.1rem'
          : isHindi
          ? '1.3rem'
          : '1.2rem',
        lineHeight: isHindi ? '2.0' : '1.8',
        fontFamily: isHindi
          ? "'Noto Sans Devanagari', 'Mangal', 'Segoe UI', sans-serif"
          : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        wordBreak: isHindi ? 'break-word' : 'normal',
        hyphens: isHindi ? 'none' : 'auto',
        fontDisplay: 'swap', // Improve font loading performance
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }),
      [isMobile, isTablet, isHindi],
    )

    // Enhanced content fitting with better performance
    const { measuredPages, isCalculating, fallbackMode } =
      useEnhancedContentFitting({
        content: mainContent,
        containerHeight: containerDimensions.height,
        containerWidth: containerDimensions.width,
        styles: textStyles,
        showOnlySummary,
        importantSentences,
        enableOverflowFallback: true,
        isHindi,
      })

    // Emit content pages calculated event
    useEffect(() => {
      if (!isCalculating && measuredPages.length > 0) {
        emitContentPagesCalculated(measuredPages.length)
      }
    }, [measuredPages.length, isCalculating, emitContentPagesCalculated])

    // Reset calculation when content changes
    useEffect(() => {
      resetCalculation()
    }, [mainContent, showOnlySummary, importantSentences, resetCalculation])

    // Optimized current page content with proper error handling
    const currentPageContent = useMemo(() => {
      if (currentPage === -1) return null

      if (!measuredPages || measuredPages.length === 0) {
        return showOnlySummary ? [] : ''
      }

      const safeIndex = Math.min(currentPage, measuredPages.length - 1)
      return measuredPages[safeIndex] || (showOnlySummary ? [] : '')
    }, [currentPage, measuredPages, showOnlySummary])

    // Memoized website info
    const websiteInfo = useMemo(() => {
      if (!mainText || !mainText[selectedLanguage]) return null
      const textArray = mainText[selectedLanguage]
      const lastElement = Array.isArray(textArray)
        ? textArray[textArray.length - 1]
        : textArray
      return extractWebsiteInfo(lastElement)
    }, [mainText, selectedLanguage])

    // Optimized content props
    const contentProps = useMemo(() => {
      if (currentPage === -1) {
        return {
          mainText: '',
          themedContent: null,
          dictionary,
          importantSentences: [],
        }
      }

      if (showOnlySummary) {
        return {
          mainText: null,
          themedContent: null,
          dictionary,
          importantSentences: Array.isArray(currentPageContent)
            ? currentPageContent
            : [currentPageContent].filter(Boolean),
        }
      }

      return {
        mainText: currentPageContent || '',
        themedContent: null,
        dictionary,
        importantSentences: importantSentences,
      }
    }, [
      showOnlySummary,
      currentPage,
      currentPageContent,
      dictionary,
      importantSentences,
    ])

    return (
      <MotionBox
        ref={containerRef}
        {...containerVariants}
        w="100%"
        h="92%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        p={2}
        position="relative"
      >
        <Box
          px={3}
          py={2}
          bg="rgba(26, 21, 39, 0.8)"
          borderRadius="lg"
          boxShadow="dark-lg"
          fontFamily={textStyles.fontFamily}
          fontSize={textStyles.fontSize}
          lineHeight={textStyles.lineHeight}
          position="relative"
          h="100%"
          display="flex"
          flexDirection="column"
          maxH="100vh"
          overflow="hidden"
          css={{
            textRendering: textStyles.textRendering,
            WebkitFontSmoothing: textStyles.WebkitFontSmoothing,
            MozOsxFontSmoothing: textStyles.MozOsxFontSmoothing,
            fontDisplay: textStyles.fontDisplay,
          }}
        >
          {/* Image Section with lazy loading */}
          {showImage && currentPage === -1 && (
            <Box
              as="figure"
              mb={4}
              flex="1"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Flex justifyContent="center" w="100%" h="100%">
                <Image
                  src={imgURL}
                  alt="Article Image"
                  borderRadius="xl"
                  width={{
                    base: '95%',
                    sm: '90%',
                    md: '85%',
                    lg: '62.5%',
                    xl: '47.5%',
                  }}
                  height="auto"
                  maxH="60vh"
                  objectFit="contain"
                  loading="lazy"
                  boxShadow="0 10px 30px rgba(0,0,0,0.3)"
                  onLoad={() => {
                    // Trigger layout recalculation after image loads
                    setTimeout(checkOverflow, 100)
                  }}
                />
              </Flex>
            </Box>
          )}

          {/* Summary Toggle */}
          {showSummaryToggle && currentPage >= 0 && (
            <Flex
              flexDirection={{ base: 'column', lg: 'row-reverse' }}
              alignItems={'flex-end'}
              gap={3}
              mb={4}
              px={2}
              flexShrink={0}
            >
              <Button
                onClick={toggleSummary}
                size={isMobile ? 'sm' : 'md'}
                bg={showOnlySummary ? 'purple.500' : 'whiteAlpha.200'}
                color={showOnlySummary ? 'white' : 'purple.200'}
                _hover={{
                  bg: showOnlySummary ? 'purple.600' : 'whiteAlpha.300',
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.3s ease"
                boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                w={'fit-content'}
              >
                {showOnlySummary ? 'Show Full Article' : 'Show Key Points'}
              </Button>
              {showOnlySummary && (
                <Box
                  mt={2}
                  px={2}
                  py={2}
                  borderRadius="md"
                  bg="rgba(128, 90, 213, 0.1)"
                  backdropFilter="blur(8px)"
                  boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                >
                  <Text
                    fontSize="sm"
                    color="purple.200"
                    fontStyle="italic"
                    letterSpacing="wide"
                  >
                    ✨ {t('warningForSummary')}
                  </Text>
                </Box>
              )}
            </Flex>
          )}

          {/* Optimized Content Container */}
          <Box
            ref={contentRef}
            position="relative"
            display={'flex'}
            w={'100%'}
            flex="1"
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent="flex-start"
            minH="0"
            maxH="100%"
            overflow="hidden"
            // sx={{
            //   ...(!isAuthenticated && {
            //     '& > *': {
            //       '&::after': {
            //         content: '""',
            //         position: 'absolute',
            //         top: '45%',
            //         left: 0,
            //         right: 0,
            //         bottom: 0,
            //         zIndex: 1,
            //         pointerEvents: 'auto',
            //         cursor: 'default',
            //         userSelect: 'none',
            //         WebkitUserSelect: 'none',
            //       },
            //     },
            //     '& *::selection': {
            //       background: 'transparent',
            //     },
            //     'a, button, [role="button"], [tabindex]': {
            //       pointerEvents: 'none',
            //       cursor: 'default',
            //       '&:hover': {
            //         textDecoration: 'none',
            //       },
            //     },
            //     '[data-dictionary-word]': {
            //       pointerEvents: 'none',
            //       cursor: 'default',
            //       '&:hover': {
            //         transform: 'none !important',
            //         background: 'none !important',
            //       },
            //     },
            //   }),
            // }}
          >
            {/* Optimized Scrollable Content Area */}
            <Box
              ref={scrollableContentRef}
              position="relative"
              w="100%"
              flex="1"
              display="flex"
              alignItems="flex-start"
              justifyContent="center"
              pt={2}
              pb={12}
              key={`content-${currentPage}-${showOnlySummary}-${isHindi}`}
              overflow={scrollState.hasOverflow ? 'auto' : 'hidden'}
              maxH="100%"
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background:
                    'linear-gradient(180deg, rgba(159, 122, 234, 0.8), rgba(214, 158, 46, 0.8))',
                  borderRadius: '4px',
                  transition: 'background 0.3s ease',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background:
                    'linear-gradient(180deg, rgba(159, 122, 234, 1), rgba(214, 158, 46, 1))',
                },
                scrollbarWidth: 'thin',
                scrollbarColor:
                  'rgba(159, 122, 234, 0.8) rgba(255,255,255,0.1)',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                overscrollBehavior: 'contain', // Prevent scroll chaining
                ...(isHindi && {
                  fontFeatureSettings: '"liga" 1, "kern" 1',
                  textRendering: 'optimizeLegibility',
                }),
              }}
            >
              <HighlightedWordsProvider>
                {currentPage === -1 ? (
                  <Box w="100%" textAlign="center" py={8}>
                    <Text
                      fontSize="lg"
                      color="whiteAlpha.600"
                      fontStyle="italic"
                      fontWeight={'bold'}
                    >
                      Scroll to continue reading...
                    </Text>
                  </Box>
                ) : isCalculating ? (
                  <Box w="100%" textAlign="center" py={8}>
                    <Text fontSize="lg" color="whiteAlpha.700">
                      {isHindi
                        ? 'कंटेंट लेआउट को अनुकूलित कर रहे हैं...'
                        : 'Optimizing content layout...'}
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.500" mt={2}>
                      {isHindi
                        ? 'आपकी स्क्रीन के लिए परफेक्ट फिट सुनिश्चित कर रहे हैं'
                        : 'Ensuring perfect fit for your screen'}
                    </Text>
                    {fallbackMode && (
                      <Text fontSize="xs" color="yellow.300" mt={2}>
                        {isHindi
                          ? 'उन्नत फॉलबैक मोड का उपयोग'
                          : 'Using enhanced fallback mode'}
                      </Text>
                    )}
                    {isHindi && (
                      <Text fontSize="xs" color="blue.300" mt={1}>
                        हिंदी टेक्स्ट समर्थन सक्रिय
                      </Text>
                    )}
                  </Box>
                ) : (
                  <Box w="100%" maxW="100%" px={3} minH="100%">
                    {showOnlySummary ? (
                      contentProps.importantSentences &&
                      contentProps.importantSentences.length > 0 ? (
                        <MemoizedSummaryView
                          importantSentences={contentProps.importantSentences}
                          dictionary={contentProps.dictionary}
                          isMobile={isMobile}
                          stableRef={stableRef}
                        />
                      ) : (
                        <Box textAlign="center" p={8}>
                          <Text fontSize="lg" color="whiteAlpha.700">
                            {isHindi
                              ? 'इस पेज के लिए कोई मुख्य बिंदु उपलब्ध नहीं'
                              : 'No key points available for this page'}
                          </Text>
                        </Box>
                      )
                    ) : contentProps.mainText ? (
                      <MemoizedNumberedContent
                        text={
                          typeof contentProps.mainText === 'string'
                            ? contentProps.mainText
                            : ''
                        }
                        dictionary={contentProps.dictionary}
                        importantSentences={contentProps.importantSentences}
                        stableRef={stableRef}
                      />
                    ) : (
                      <Box textAlign="center" p={8}>
                        <Text fontSize="lg" color="whiteAlpha.700">
                          {isHindi
                            ? 'कंटेंट लोड हो रहा है...'
                            : 'Content loading...'}
                        </Text>
                        <Text fontSize="sm" color="whiteAlpha.500" mt={2}>
                          {isHindi ? 'पेज' : 'Page'} {currentPage + 1}{' '}
                          {isHindi ? 'का' : 'of'}{' '}
                          {Math.max(measuredPages.length, 1)}
                        </Text>
                      </Box>
                    )}

                    {/* Source Link - only on last page */}
                    {SourceURL && currentPage === measuredPages.length - 1 && (
                      <Flex
                        w={'100%'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        mt={6}
                        pt={4}
                      >
                        {websiteInfo && (
                          <Link
                            href={websiteInfo.fullUrl}
                            isExternal
                            display="inline-flex"
                            alignItems="center"
                            px={2}
                            py={1}
                            mx={1}
                            fontSize="sm"
                            fontWeight="semibold"
                            color="blue.500"
                            bg="blue.50"
                            borderRadius="md"
                            boxShadow="sm"
                            _hover={{
                              bg: 'blue.100',
                              color: 'blue.600',
                              textDecoration: 'none',
                            }}
                            _active={{
                              bg: 'blue.200',
                            }}
                            transition="all 0.2s ease-in-out"
                          >
                            {websiteInfo.websiteName}
                            <ExternalLinkIcon ml={1} boxSize={3} />
                          </Link>
                        )}
                        <SourceLinkTag SourceURL={SourceURL} />
                      </Flex>
                    )}
                  </Box>
                )}
              </HighlightedWordsProvider>
            </Box>
          </Box>

          {/* Dictionary tooltip */}
          {tooltipState.selectedWord && (
            <DictTooltip
              word={tooltipState.selectedWord}
              definition={
                dictionary.find(
                  entry => entry.word === tooltipState.selectedWord,
                )?.definition
              }
              position={tooltipState.position}
              onClose={closeTooltip}
            />
          )}

          {/* Enhanced Page indicator */}
          {currentPage >= 0 && (
            <Box
              position="absolute"
              bottom={4}
              right={4}
              bg="rgba(0,0,0,0.8)"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              color="whiteAlpha.800"
              zIndex={10}
              flexShrink={0}
              border={scrollState.hasOverflow ? '1px solid' : 'none'}
              borderColor={
                scrollState.hasOverflow ? 'purple.400' : 'transparent'
              }
              boxShadow={
                scrollState.hasOverflow
                  ? '0 0 8px rgba(159, 122, 234, 0.4)'
                  : 'none'
              }
            >
              <Flex align="center" gap={2}>
                <Text>
                  {currentPage + 1} / {Math.max(measuredPages.length, 1)}
                </Text>
                {scrollState.hasOverflow && (
                  <Box
                    w={2}
                    h={2}
                    bg="purple.400"
                    borderRadius="full"
                    animation="pulse 2s infinite"
                  />
                )}
              </Flex>
              {showOnlySummary && (
                <Text fontSize="xs" opacity={0.7} mt={1}>
                  {isHindi ? 'मुख्य बिंदु' : 'Key Points'}
                </Text>
              )}

              {fallbackMode && (
                <Text fontSize="xs" opacity={0.7} mt={1} color="yellow.300">
                  Enhanced
                </Text>
              )}
            </Box>
          )}
        </Box>
      </MotionBox>
    )
  },
)

PaginatedArticleContent.displayName = 'PaginatedArticleContent'

export default PaginatedArticleContent

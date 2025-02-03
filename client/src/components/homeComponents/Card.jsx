import React, { useRef, useEffect } from 'react'
import {
  Box,
  Image,
  Text,
  Flex,
  Badge,
  VStack,
  HStack,
  Circle,
  Heading,
  Link,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { motion, useAnimation, useSpring, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import slugify from 'slugify'
import { useDispatch } from 'react-redux'
import { setArticleData } from '../../redux/articleSlice'
import { useTranslation } from 'react-i18next'
import CalendarSVG from '../../assets/svg/CalenderSVG'
import ClockSVG from '../../assets/svg/ClockSVG'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { useFeatureDetection } from '../../utils/featureDetection'
import useSafeSound from '../../customHooks/useSafeSound'

import {
  ARTICLE_DIFFICULTY,
  ICONS_ARTICLE_DIFFICULTY,
  DIFF_COLOR,
} from '../../models/articleDifficulty'

const MotionBox = motion(Box)
const MotionImage = motion(Image)
const MotionText = motion(Text)
const MotionBadge = motion(Badge)
const MotionCircle = motion(Circle)
const MotionHeading = motion(Heading)

const getDifficultyColor = difficulty => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return {
        bg: 'green.400',
        shadow: 'green.600',
        glow: 'rgba(72, 187, 120, 0.5)',
        starGlow: '#48BB78',
      }
    case 'medium':
      return {
        bg: 'yellow.400',
        shadow: 'yellow.600',
        glow: 'rgba(236, 201, 75, 0.5)',
        starGlow: '#ECC94B',
      }
    case 'hard':
      return {
        bg: 'red.400',
        shadow: 'red.600',
        glow: 'rgba(245, 101, 101, 0.5)',
        starGlow: '#F56565',
      }
    default:
      return {
        bg: 'green.400',
        shadow: 'green.600',
        glow: 'rgba(72, 187, 120, 0.5)',
        starGlow: '#48BB78',
      }
  }
}

const Card = React.memo(
  ({
    title,
    image,
    category,
    date,
    readTime,
    id,
    articleData,
    urlTitle,
    difficulty,
    multiplier,
  }) => {
    const { t } = useTranslation('Card')
    const { t: diffTranslation } = useTranslation('DifficultyLegend')
    const cardRef = useRef(null)
    const navigate = useNavigate()
    const controls = useAnimation()
    const features = useFeatureDetection()
    const { playClick } = useSafeSound({
      enabled: features.hasAudioSupport,
      volume: 0.5,
    })
    const dispatch = useDispatch()

    const x = useSpring(0, { stiffness: 150, damping: 30 })
    const y = useSpring(0, { stiffness: 150, damping: 30 })

    const rotateX = useTransform(y, [-25, 25], [3, -3])
    const rotateY = useTransform(x, [-25, 25], [-3, 3])

    useEffect(() => {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
      })
    }, [controls])

    const handleMouseMove = event => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        x.set(event.clientX - centerX)
        y.set(event.clientY - centerY)
      }
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    const handleClick = () => {
      playClick()
      dispatch(setArticleData(articleData))
      navigate(`/article/${id}/${slugify(urlTitle)}`)
    }

    const variants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: 'easeOut',
        },
      },
      hover: {
        scale: 1.05,
        transition: { duration: 0.2 },
      },
      tap: {
        scale: 0.95,
      },
    }

    return (
      <Link
        as={RouterLink}
        to={`/article/${id}/${slugify(urlTitle)}`}
        onClick={handleClick}
        _hover={{ textDecoration: 'none' }}
        display="block"
        draggable="false"
        aria-label={`Read article: ${title}`}
        itemScope
        itemType="http://schema.org/Article"
      >
        <meta itemProp="headline" content={title} />
        <meta itemProp="datePublished" content={date} />
        <meta itemProp="image" content={image} />
        <meta itemProp="articleSection" content={category} />
        <MotionBox
          ref={cardRef}
          w={'xs'}
          h={{ base: '26rem', md: 'md' }}
          borderRadius="2xl"
          overflow="hidden"
          bg="linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)"
          color="white"
          cursor="pointer"
          boxShadow="xl"
          position="relative"
          variants={variants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            perspective: 1000,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          layoutId={`card-${id}`}
        >
          {/* Enhanced Star with better positioning and glow */}
          {/* Dynamic Difficulty Icon */}
          {difficulty && (
            <Box
              position="absolute"
              top="-3px"
              left="-3px"
              zIndex="2"
              transform="rotate(0deg)"
              width="48px"
              height="48px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <motion.div
                initial={{ rotate: -30, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
              >
                <Box
                  position="relative"
                  color={DIFF_COLOR[difficulty?.toLowerCase()]}
                >
                  {(() => {
                    const IconComponent =
                      ICONS_ARTICLE_DIFFICULTY[difficulty?.toLowerCase()]
                    return <IconComponent size={24} />
                  })()}
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    width="100%"
                    height="100%"
                    borderRadius="full"
                    bg={getDifficultyColor(difficulty).glow}
                    filter="blur(8px)"
                    opacity="0.6"
                    zIndex="-1"
                  />
                </Box>
              </motion.div>
            </Box>
          )}
          {/* Difficulty Badge with Golden Frame */}
          {/* Royal Reward Difficulty Badge with Gold Frame */}
          {/* Royal Reward Difficulty Badge */}
          {difficulty && (
            <Box
              position="absolute"
              top="2px"
              right="2px"
              zIndex="2"
              transition="all 0.3s ease"
              _hover={{
                transform: 'translateY(2px) scale(1.02)',
                filter: 'brightness(1.1)',
              }}
            >
              {/* Outer Decorative Frame */}
              <Box
                position="relative"
                padding="2px"
                borderRadius="xl"
                style={{
                  background: `linear-gradient(45deg, #251C44, #312456, #251C44)`, // Dark purple frame
                  boxShadow: `
        0 4px 20px rgba(37, 28, 68, 0.3),
        0 0 15px rgba(37, 28, 68, 0.2)
      `,
                }}
              >
                {/* Main Badge Container */}
                <Box
                  position="relative"
                  px="6"
                  py="2"
                  borderRadius="lg"
                  overflow="hidden"
                  style={{
                    background: '#251C44', // Dark purple background
                    border: `2px solid ${
                      difficulty?.toLowerCase() === 'easy'
                        ? '#22c55e'
                        : difficulty?.toLowerCase() === 'medium'
                        ? '#FFB800'
                        : '#ef4444'
                    }`,
                  }}
                >
                  {/* Royal Corner Ornaments */}
                  {[...Array(4)].map((_, i) => (
                    <Box
                      key={i}
                      position="absolute"
                      {...{
                        0: {
                          top: '0',
                          left: '0',
                          transform: 'translate(-25%, -25%)',
                        },
                        1: {
                          top: '0',
                          right: '0',
                          transform: 'translate(25%, -25%)',
                        },
                        2: {
                          bottom: '0',
                          left: '0',
                          transform: 'translate(-25%, 25%)',
                        },
                        3: {
                          bottom: '0',
                          right: '0',
                          transform: 'translate(25%, 25%)',
                        },
                      }[i]}
                    >
                      <Box
                        position="relative"
                        width="12px"
                        height="12px"
                        transform="rotate(45deg)"
                        style={{
                          background:
                            difficulty?.toLowerCase() === 'easy'
                              ? '#22c55e'
                              : difficulty?.toLowerCase() === 'medium'
                              ? '#FFB800'
                              : '#ef4444',
                          borderRadius: '2px',
                        }}
                      />
                    </Box>
                  ))}

                  {/* Shine Effect */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    style={{
                      background:
                        'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                      animation: 'shine 3s infinite linear',
                    }}
                  />

                  <Text
                    fontSize="sm"
                    fontWeight="black"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                    px="1"
                    textAlign="center"
                    position="relative"
                    color={
                      difficulty?.toLowerCase() === 'easy'
                        ? 'green'
                        : difficulty?.toLowerCase() === 'medium'
                        ? 'yellow'
                        : 'red'
                    }
                    style={{
                      textShadow: `
            0 0 10px ${
              difficulty?.toLowerCase() === 'easy'
                ? 'rgba(38, 180, 90, 0.5)'
                : difficulty?.toLowerCase() === 'medium'
                ? 'rgba(201, 152, 30, 0.5)'
                : 'rgba(177, 45, 45, 0.5)'
            }
          `,
                    }}
                  >
                    {diffTranslation(difficulty?.toLocaleLowerCase())}
                  </Text>

                  {/* Metallic Accent Lines */}
                  <Box
                    position="absolute"
                    left="0"
                    right="0"
                    bottom="0"
                    height="1px"
                    style={{
                      background: `linear-gradient(to right, transparent, ${
                        difficulty?.toLowerCase() === 'easy'
                          ? '#22c55e'
                          : difficulty?.toLowerCase() === 'medium'
                          ? '#FFB800'
                          : '#ef4444'
                      }40, transparent)`,
                    }}
                  />
                </Box>
              </Box>

              {/* Add subtle glow effect */}
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                borderRadius="xl"
                filter="blur(8px)"
                style={{
                  background:
                    difficulty?.toLowerCase() === 'easy'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : difficulty?.toLowerCase() === 'medium'
                      ? 'rgba(255, 184, 0, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                  zIndex: -1,
                }}
              />
            </Box>
          )}
          <Box
            overflow="hidden"
            height="200px"
            style={{ transform: 'translateZ(20px)' }}
          >
            <MotionImage
              src={image}
              alt={title}
              h="100%"
              w="100%"
              objectFit="cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              variants={variants.image}
              onError={e => (e.target.src = '/images/fallback_news_image.webp')}
              loading="lazy"
              itemProp="image"
            />
          </Box>

          <VStack
            align="start"
            p={6}
            spacing={4}
            style={{ transform: 'translateZ(50px)' }}
          >
            <HStack spacing={2} flexWrap="wrap">
              <MotionBadge
                colorScheme="purple"
                fontWeight="bold"
                fontSize="xs"
                textTransform="uppercase"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {category}
              </MotionBadge>
              <MotionBadge
                colorScheme="blue"
                variant="outline"
                fontSize="xs"
                display="flex"
                alignItems="center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CalendarSVG size={12} style={{ marginRight: '4px' }} />
                {date}
              </MotionBadge>

              {/* Enhanced Multiplier Badge */}
              {multiplier && (
                <MotionBox
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  position="relative"
                >
                  <Box
                    bg="linear-gradient(135deg, #FF6B6B 0%, #9F67FF 100%)"
                    px="3"
                    py="1"
                    borderRadius="full"
                    boxShadow="0 4px 12px rgba(159, 103, 255, 0.4)"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                      animation: 'shine 2s infinite',
                    }}
                  >
                    <HStack spacing="1" alignItems="center">
                      <Text
                        color="white"
                        fontSize="xs"
                        fontWeight="extrabold"
                        textShadow="0 2px 4px rgba(0,0,0,0.2)"
                      >
                        {multiplier}
                      </Text>
                      <Text
                        color="yellow.200"
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        Boost
                      </Text>
                    </HStack>
                  </Box>
                </MotionBox>
              )}
            </HStack>

            <MotionHeading
              as="h3"
              fontSize="md"
              fontWeight="bold"
              lineHeight="shorter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              textAlign={'left'}
              itemProp="headline"
            >
              {title}
            </MotionHeading>
          </VStack>

          <Flex
            justify="space-between"
            w="100%"
            alignItems="center"
            position={'absolute'}
            px={6}
            bottom={3}
          >
            <HStack spacing={2}>
              <ClockSVG size={14} color="#fff" />
              <MotionText
                fontSize="sm"
                fontWeight="medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                {readTime} {t('minRead')}
              </MotionText>
            </HStack>
            <MotionCircle
              size="40px"
              bg="blue.500"
              color="white"
              variants={variants.arrow}
              animate={controls}
              whileHover={{ bg: 'blue.600' }}
              transition={{ duration: 0.2 }}
            >
              <ArrowForwardIcon size={20} fill="#fff" />
            </MotionCircle>
          </Flex>
        </MotionBox>
      </Link>
    )
  },
)

export default Card

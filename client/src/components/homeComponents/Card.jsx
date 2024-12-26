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
} from '@chakra-ui/react'
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

const MotionBox = motion(Box)
const MotionImage = motion(Image)
const MotionText = motion(Text)
const MotionBadge = motion(Badge)
const MotionCircle = motion(Circle)
const MotionHeading = motion(Heading)

const Card = React.memo(
  ({ title, image, category, date, readTime, id, articleData, urlTitle }) => {
    const { t } = useTranslation('Card')
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

    // Initialize animation
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
      <MotionBox
        ref={cardRef}
        w={'xs'}
        h={{ base: '26rem', md: 'md' }}
        borderRadius="2xl"
        overflow="hidden"
        bg="linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)"
        onClick={handleClick}
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
          />
        </Box>

        <VStack
          align="start"
          p={6}
          spacing={4}
          style={{ transform: 'translateZ(50px)' }}
        >
          <HStack spacing={2}>
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
    )
  },
)

export default Card

import React, { useRef } from 'react'
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
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSound from '../../customHooks/useSound'
import slugify from 'slugify'
import { useDispatch } from 'react-redux'
import { setArticleData } from '../../redux/articleSlice'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionImage = motion(Image)
const MotionText = motion(Text)
const MotionBadge = motion(Badge)
const MotionCircle = motion(Circle)
const MotionHeading = motion(Heading)

const Card = ({
  title,
  image,
  category,
  date,
  readTime,
  id,
  articleData,
  urlTitle,
}) => {
  const { t } = useTranslation('Card')
  const cardRef = useRef(null)
  const navigate = useNavigate()
  const controls = useAnimation()
  const { playClick } = useSound()
  const dispatch = useDispatch()

  // Increase stiffness for faster response, and decrease damping for more fluid motion
  const x = useSpring(0, { stiffness: 150, damping: 30 })
  const y = useSpring(0, { stiffness: 150, damping: 30 })

  // Increase the rotation range for a more pronounced effect
  const rotateX = useTransform(y, [-25, 25], [3, -3])
  const rotateY = useTransform(x, [-25, 25], [-3, 3])

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

  const cardVariants = {
    hover: {
      scale: 1.05,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    tap: {
      scale: 0.95,
      transition: { type: 'spring', stiffness: 500, damping: 30 },
    },
  }

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  }

  const arrowVariants = {
    hover: {
      x: [0, 10, 0],
      transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
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
      onClick={() => {
        playClick()
        dispatch(setArticleData(articleData))
        navigate(`/article/${id}/${slugify(urlTitle)}`)
      }}
      color="white"
      cursor="pointer"
      boxShadow="xl"
      position="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        transition: 'transform 0.1s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => {
        controls.start('hover')
      }}
      onHoverEnd={() => {
        controls.stop()
        handleMouseLeave()
      }}
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
          variants={imageVariants}
          onError={e => (e.target.src = '/images/rrlogo_HD.webp')}
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
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
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
            transition={{
              delay: 0.4,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          >
            <Calendar size={12} style={{ marginRight: '4px' }} />
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
          transition={{
            delay: 0.5,
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
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
          <Clock size={14} />
          <MotionText
            fontSize="sm"
            fontWeight="medium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.6,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          >
            {readTime} {t('minRead')}
          </MotionText>
        </HStack>
        <MotionCircle
          size="40px"
          bg="blue.500"
          color="white"
          variants={arrowVariants}
          animate={controls}
          whileHover={{ bg: 'blue.600' }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight size={20} />
        </MotionCircle>
      </Flex>
    </MotionBox>
  )
}

export default Card

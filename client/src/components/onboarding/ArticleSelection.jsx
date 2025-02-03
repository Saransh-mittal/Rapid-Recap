import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Box,
  Grid,
  Text,
  VStack,
  useBreakpointValue,
  Container,
  Image,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { BookOpen, Star, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import MajesticLoading from './MajesticLoading'
import { getVisitedArticle } from '../../utils/article.utils'

const ArticleCard = ({
  article,
  type,
  selectedId,
  setSelectedId,
  imgFallback = '/images/placeholder.jpg',
}) => {
  const { t } = useTranslation('OnboardingProcess')
  const isPreviouslyViewed = type === 'visited'
  const badgeConfig = isPreviouslyViewed
    ? {
        color: '#fff',
        bg: 'rgba(139, 92, 246, 0.4)',
        borderColor: 'purple.400',
        text: t('articleSelection.previouslyViewed'),
        glowColor: 'rgba(139, 92, 246, 0.6)',
      }
    : {
        color: '#fff',
        bg: 'rgba(236, 72, 153, 0.4)',
        borderColor: 'pink.400',
        text: t('articleSelection.recommended'),
        glowColor: 'rgba(236, 72, 153, 0.6)',
      }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        bg="rgba(30, 25, 44, 0.85)"
        borderRadius="3xl"
        overflow="hidden"
        position="relative"
        cursor="pointer"
        border="1px solid"
        borderColor={
          selectedId === type
            ? badgeConfig.borderColor
            : 'rgba(255, 255, 255, 0.1)'
        }
        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        backdropFilter="blur(12px)"
        boxShadow={
          selectedId === type
            ? `0 8px 40px -4px ${badgeConfig.glowColor}`
            : '0 8px 32px rgba(0, 0, 0, 0.2)'
        }
        _hover={{
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px -8px ${badgeConfig.glowColor}`,
          borderColor:
            selectedId === type
              ? badgeConfig.borderColor
              : 'rgba(255, 255, 255, 0.2)',
        }}
        onClick={() => setSelectedId(type)}
      >
        <Box position="relative" h="260px">
          <Image
            src={article?.imgURL || imgFallback}
            alt={article?.title}
            fallbackSrc={imgFallback}
            w="full"
            h="full"
            objectFit="cover"
            transition="transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
            _groupHover={{ transform: 'scale(1.05)' }}
          />
          <Box
            position="absolute"
            inset={0}
            bgGradient={`linear(to-b,
              transparent 0%,
              ${
                isPreviouslyViewed
                  ? 'rgba(88, 65, 137, 0.8)'
                  : 'rgba(157, 47, 89, 0.8)'
              } 50%,
              ${
                isPreviouslyViewed
                  ? 'rgba(88, 65, 137, 0.95)'
                  : 'rgba(157, 47, 89, 0.95)'
              } 100%
            )`}
          />

          <HStack
            position="absolute"
            top={4}
            right={4}
            bg={badgeConfig.bg}
            color={badgeConfig.color}
            borderRadius="full"
            border="1px solid"
            borderColor={badgeConfig.borderColor}
            backdropFilter="blur(8px)"
            px={4}
            py={2}
            spacing={2}
            boxShadow={`0 4px 20px ${badgeConfig.glowColor}`}
            fontWeight="semibold"
            letterSpacing="0.5px"
          >
            <Icon as={isPreviouslyViewed ? BookOpen : Star} w={4} h={4} />
            <Text fontSize="sm" fontWeight="medium" letterSpacing="wide">
              {badgeConfig.text}
            </Text>
          </HStack>
        </Box>

        <VStack
          align="stretch"
          p={8}
          spacing={6}
          bg={`linear-gradient(180deg,
            ${
              isPreviouslyViewed
                ? 'rgba(88, 65, 137, 0.2)'
                : 'rgba(157, 47, 89, 0.2)'
            } 0%,
            transparent 100%
          )`}
        >
          <VStack align="stretch" spacing={4}>
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              color="white"
              lineHeight="1.3"
              letterSpacing="tight"
              _groupHover={{
                color: isPreviouslyViewed ? 'purple.200' : 'pink.200',
              }}
              transition="color 0.3s"
            >
              {article?.title}
            </Text>

            <Text
              color="whiteAlpha.800"
              fontSize={{ base: 'sm', md: 'md' }}
              noOfLines={3}
              lineHeight="tall"
            >
              {article?.mainText}
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <HStack
              spacing={{ base: 3, md: 6 }}
              flexDirection={{ base: 'column', sm: 'row' }}
              align={{ base: 'flex-start', sm: 'center' }}
            >
              <HStack spacing={2}>
                <Clock
                  size={16}
                  color={isPreviouslyViewed ? '#D6BCFA' : '#FBB6CE'}
                />
                <Text
                  color={isPreviouslyViewed ? 'purple.200' : 'pink.200'}
                  fontSize="sm"
                  whiteSpace="nowrap"
                >
                  {t('articleSelection.minuteRead', {
                    minutes: article?.avgReadTime,
                  })}
                </Text>
              </HStack>

              <HStack spacing={2}>
                {isPreviouslyViewed ? (
                  <BookOpen size={16} color="#D6BCFA" />
                ) : (
                  <Star size={16} color="#FBB6CE" />
                )}
                <Text
                  color={isPreviouslyViewed ? 'purple.200' : 'pink.200'}
                  fontSize="sm"
                  whiteSpace="nowrap"
                >
                  {isPreviouslyViewed
                    ? t('articleSelection.continueReading')
                    : t('articleSelection.beginnerFriendly')}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </motion.div>
  )
}

const ArticleSelection = ({
  errorFecthinArticle,
  onArticleSelect,
  randomArticle,
  visitedArticle,
  isArticleFetching,
  isVisitedArticleFetching,
}) => {
  const { t } = useTranslation('OnboardingProcess')
  const [selectedId, setSelectedId] = useState(null)
  const columns = useBreakpointValue({ base: 1, md: 2 })
  const spacing = useBreakpointValue({ base: 6, md: 10 })

  useEffect(() => {
    if (selectedId) {
      const timer = setTimeout(() => {
        onArticleSelect(
          selectedId === 'visited' ? visitedArticle : randomArticle,
        )
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [selectedId, onArticleSelect, visitedArticle, randomArticle])

  if (isArticleFetching || isVisitedArticleFetching) {
    return (
      <Box
        maxH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        w="100%"
        h="100vh"
      >
        <MajesticLoading />
      </Box>
    )
  }

  if (!getVisitedArticle() || errorFecthinArticle) {
    onArticleSelect(randomArticle)
  }
  if (!visitedArticle) {
    return null
  }

  return (
    <Container maxW="8xl" minH="100vh" display="flex" alignItems="center">
      <VStack spacing={8} w="full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <VStack spacing={6} mt={4}>
            <Text
              fontSize={{ base: '3xl', md: '6xl' }}
              fontWeight="bold"
              textAlign="center"
              bgGradient="linear(to-r, purple.200, pink.200)"
              bgClip="text"
              letterSpacing="tight"
              textShadow="0 2px 20px rgba(167, 139, 250, 0.2)"
            >
              {t('articleSelection.title')}
            </Text>
          </VStack>
        </motion.div>
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          color="whiteAlpha.800"
          textAlign="center"
          maxW="2xl"
          px={4}
          letterSpacing="wide"
        >
          {t('articleSelection.subtitle')}
        </Text>
        <Grid
          templateColumns={`repeat(${columns}, 1fr)`}
          gap={spacing}
          w="full"
          px={{ base: 4, md: 8 }}
        >
          <ArticleCard
            article={visitedArticle}
            type="visited"
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            imgFallback="/images/article-placeholder.jpg"
          />
          <ArticleCard
            article={randomArticle}
            type="random"
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            imgFallback="/images/article-placeholder.jpg"
          />
        </Grid>
      </VStack>
    </Container>
  )
}

export default ArticleSelection

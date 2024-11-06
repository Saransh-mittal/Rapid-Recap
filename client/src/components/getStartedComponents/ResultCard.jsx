import React from 'react'
import {
  Box,
  VStack,
  Text,
  ListItem,
  Image,
  Flex,
  Badge,
  Skeleton,
  HStack,
} from '@chakra-ui/react'

import { Book, Clock, Calendar } from 'lucide-react'

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const MotionListItem = motion(ListItem)

const ResultCard = React.memo(({ article, index, COLORS }) => {
  const navigate = useNavigate()
  return (
    <MotionListItem
      layout // Add layout prop to handle smooth transitions
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      borderBottom="1px solid"
      borderColor={COLORS.cardBorder}
      _last={{ borderBottom: 'none' }}
      onClick={() => {
        navigate(`/article/${article._id}`)
      }}
    >
      <Flex
        p={4}
        gap={4}
        _hover={{
          bg: 'rgba(237, 100, 166, 0.1)',
          cursor: 'pointer',
        }}
        transition="all 0.2s"
        role="group"
      >
        <Box flexShrink={0} w="100px" h="100px" position="relative">
          <Image
            src={article.imgURL || '/images/placeholder.jpg'}
            alt={article.title}
            objectFit="cover"
            w="100%"
            h="100%"
            borderRadius="md"
            fallback={<Skeleton w="100px" h="100px" borderRadius="md" />}
          />
        </Box>

        <VStack align="start" spacing={2} flex={1}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="white"
            _groupHover={{ color: COLORS.accent }}
            transition="color 0.2s"
          >
            {article.title}
          </Text>

          <Flex gap={4} flexWrap="wrap">
            <HStack spacing={1} color="whiteAlpha.700">
              <Calendar size={14} />
              <Text fontSize="sm">{article.date}</Text>
            </HStack>
            <HStack spacing={1} color="whiteAlpha.700">
              <Clock size={14} />
              <Text fontSize="sm">{article.avgReadTime} min read</Text>
            </HStack>
            <HStack spacing={1} color="whiteAlpha.700">
              <Book size={14} />
              <Text fontSize="sm">{article.quizAttemptCnt} attempts</Text>
            </HStack>
          </Flex>

          <Badge
            colorScheme="pink"
            variant="subtle"
            px={2}
            py={1}
            borderRadius="full"
          >
            {article.category}
          </Badge>
        </VStack>
      </Flex>
    </MotionListItem>
  )
})

ResultCard.displayName = 'ResultCard'
export default ResultCard

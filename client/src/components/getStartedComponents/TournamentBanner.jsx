import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Stack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSafeSound from '../../customHooks/useSafeSound'
import { useFeatureDetection } from '../../utils/featureDetection'

// Add this component definition in the same file, above the HeroV2 component
const TournamentBanner = ({ COLORS, shine }) => {
  const navigate = useNavigate()
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  return (
    <Box
      mt={8}
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg="rgba(44, 41, 86, 0.8)"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor={COLORS.cardBorder}
      _hover={{
        borderColor: COLORS.accent,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Animated gradient border */}
      <Box
        bgGradient={`linear(to-r, ${COLORS.accent}, ${COLORS.secondary})`}
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        animation={`${shine} 3s linear infinite`}
        backgroundSize="200% auto"
      />

      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align="center"
        p={6}
        spacing={4}
      >
        <HStack spacing={4}>
          <Box
            as={motion.div}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 1 }}
          >
            <Trophy color={COLORS.accent} size={30} />
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              Weekend Tournament Starting Soon
            </Text>
            <HStack spacing={4}>
              <Text color="whiteAlpha.800">Starts in 2 days</Text>
              <Badge
                bg="rgba(237, 100, 166, 0.1)"
                color={COLORS.accent}
                px={3}
                py={1}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Star size={12} />
                Earn amazing badges
              </Badge>
            </HStack>
          </VStack>
        </HStack>

        <Button
          variant="outline"
          borderColor={COLORS.accent}
          color={COLORS.accent}
          _hover={{
            bg: 'rgba(237, 100, 166, 0.1)',
            transform: 'translateY(-2px)',
          }}
          leftIcon={<Star size={16} />}
          size={{ base: 'md', md: 'lg' }}
          px={6}
          transition="all 0.3s ease"
          onClick={() => {
            playClick()
            navigate('/tournament')
          }}
        >
          View Details
        </Button>
      </Stack>

      {/* Background particle effect */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        bg={`repeating-linear-gradient(
        45deg,
        ${COLORS.accent},
        ${COLORS.accent} 10px,
        transparent 10px,
        transparent 20px
      )`}
        zIndex={0}
        pointerEvents="none"
      />
    </Box>
  )
}
export default TournamentBanner

import React from 'react'
import { Box, Flex, VStack, HStack } from '@chakra-ui/react'
import { shimmer, pulse } from './animations'

const SkeletonCard = React.memo(() => (
  <Box
    w="xs"
    h={{ base: '26rem', md: 'md' }}
    borderRadius="2xl"
    overflow="hidden"
    position="relative"
    boxShadow="xl"
    sx={{
      background:
        'linear-gradient(135deg, rgba(30,41,59,0.7) 0%, rgba(51,65,85,0.8) 100%)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.1)',
      animation: `${pulse} 2s ease-in-out infinite`,
    }}
  >
    <Box
      height="200px"
      position="relative"
      overflow="hidden"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(90deg, rgba(51,65,85,0.1) 0%, rgba(71,85,105,0.3) 50%, rgba(51,65,85,0.1) 100%)',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 3s infinite ease-in-out`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(180deg, rgba(30,41,59,0) 0%, rgba(30,41,59,0.1) 100%)',
        },
      }}
    />

    <VStack align="start" p={6} spacing={4}>
      <HStack spacing={2}>
        <ShimmerBox
          width="80px"
          gradientColors={['rgba(124,58,237,0.2)', 'rgba(139,92,246,0.3)']}
        />
        <ShimmerBox
          width="120px"
          gradientColors={['rgba(59,130,246,0.2)', 'rgba(96,165,250,0.3)']}
        />
      </HStack>

      <VStack align="start" width="100%" spacing={2}>
        <ShimmerBox width="100%" />
        <ShimmerBox width="80%" />
      </VStack>
    </VStack>

    <Flex
      justify="space-between"
      w="100%"
      alignItems="center"
      position="absolute"
      px={6}
      bottom={3}
    >
      <ShimmerBox width="80px" />
      <ShimmerBox
        width="40px"
        height="40px"
        borderRadius="full"
        gradientColors={['rgba(59,130,246,0.3)', 'rgba(147,51,234,0.3)']}
      />
    </Flex>

    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="none"
      sx={{
        background:
          'linear-gradient(180deg, rgba(30,41,59,0) 0%, rgba(30,41,59,0.05) 100%)',
        borderRadius: '2xl',
      }}
    />
  </Box>
))

const ShimmerBox = React.memo(
  ({
    width,
    height = '20px',
    borderRadius = 'md',
    gradientColors = ['rgba(51,65,85,0.4)', 'rgba(71,85,105,0.5)'],
  }) => (
    <Box
      height={height}
      width={width}
      borderRadius={borderRadius}
      bg={`linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`}
      position="relative"
      overflow="hidden"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 3s infinite ease-in-out`,
        },
      }}
    />
  ),
)

export default SkeletonCard

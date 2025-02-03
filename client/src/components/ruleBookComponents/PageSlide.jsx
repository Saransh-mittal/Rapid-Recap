// src/components/ruleBookComponents/PageSlide.jsx
import React, { memo, useMemo } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Collapse,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, Info, ChevronDown } from 'lucide-react'

const MotionBox = motion(Box)

// Memoized ListItem component
const ListItem = memo(({ item, index, isMobile }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  // Simplified animation for weaker devices
  const animation = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { delay: index * 0.03 },
    }),
    [index],
  )

  return (
    <MotionBox {...animation} position="relative">
      <Box
        onClick={() => item.hasDetails && setIsOpen(!isOpen)}
        cursor={item.hasDetails ? 'pointer' : 'default'}
        borderRadius="xl"
        bg="rgba(20, 17, 35, 0.7)"
        p={3}
        mb={2}
        border="1px solid"
        borderColor={isOpen ? 'pink.400' : 'transparent'}
        transition="all 0.2s"
        _hover={{
          bg: item.hasDetails
            ? 'rgba(20, 17, 35, 0.9)'
            : 'rgba(20, 17, 35, 0.7)',
          borderColor: item.hasDetails ? 'pink.400' : 'transparent',
        }}
      >
        <HStack spacing={3}>
          <Icon
            as={Info}
            w={4}
            h={4}
            color={item.hasDetails ? 'pink.400' : 'whiteAlpha.400'}
          />

          <Text flex={1} fontSize={isMobile ? 'sm' : 'md'} color="white">
            {item.text}
          </Text>

          {item.hasDetails && (
            <Icon
              as={ChevronDown}
              w={4}
              h={4}
              color="pink.400"
              transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
              transition="transform 0.2s"
            />
          )}
        </HStack>
      </Box>

      <Collapse in={isOpen} animateOpacity>
        <Box
          ml={4}
          p={3}
          bg="rgba(20, 17, 35, 0.5)"
          borderRadius="lg"
          borderLeft="2px solid"
          borderColor="pink.400"
        >
          <Text
            color="whiteAlpha.800"
            fontSize={isMobile ? 'xs' : 'sm'}
            lineHeight="1.6"
          >
            {item.explanation}
          </Text>
        </Box>
      </Collapse>
    </MotionBox>
  )
})

// Memoized Section component
const Section = memo(({ title, subtitle, items, isMobile }) => (
  <Box mb={6}>
    <Box bg="rgba(20, 17, 35, 0.8)" p={4} borderRadius="xl" mb={4}>
      <HStack spacing={3} mb={2}>
        <Icon
          as={Book}
          color="pink.400"
          w={isMobile ? 4 : 5}
          h={isMobile ? 4 : 5}
        />
        <Text
          color="purple.300"
          fontWeight="bold"
          fontSize={isMobile ? 'md' : 'lg'}
        >
          {subtitle}
        </Text>
      </HStack>
    </Box>

    <VStack spacing={2} align="stretch">
      {items.map((item, i) => (
        <ListItem key={i} item={item} index={i} isMobile={isMobile} />
      ))}
    </VStack>
  </Box>
))

// Main PageSlide component
const PageSlide = ({ content, title }) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Simplified header animation for weaker devices
  const headerAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  }

  return (
    <Box
      bg="rgba(20, 17, 35, 0.95)"
      borderRadius={isMobile ? 'lg' : '2xl'}
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.200"
      height="full"
      position="relative"
    >
      {/* Header */}
      <MotionBox
        {...headerAnimation}
        p={isMobile ? 4 : 6}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        bg="rgba(20, 17, 35, 0.95)"
      >
        <HStack spacing={3}>
          <Box bg="rgba(236, 72, 153, 0.1)" p={2} borderRadius="lg">
            <Icon
              as={Book}
              color="pink.400"
              w={isMobile ? 5 : 6}
              h={isMobile ? 5 : 6}
            />
          </Box>

          <Text
            fontSize={isMobile ? 'xl' : '2xl'}
            fontWeight="bold"
            bgGradient="linear(to-r, pink.400, purple.400)"
            bgClip="text"
          >
            {title}
          </Text>
        </HStack>
      </MotionBox>

      {/* Content */}
      <Box
        p={isMobile ? 3 : 5}
        overflowY="auto"
        maxH={isMobile ? 'calc(100vh - 150px)' : 'calc(100vh - 200px)'}
        sx={{
          '&::-webkit-scrollbar': {
            width: '2px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '1px',
          },
        }}
      >
        {Object.entries(content).map(([subtitle, items], index) => (
          <Section
            key={subtitle}
            title={title}
            subtitle={subtitle}
            items={items}
            isMobile={isMobile}
          />
        ))}
      </Box>
    </Box>
  )
}

export default memo(PageSlide)

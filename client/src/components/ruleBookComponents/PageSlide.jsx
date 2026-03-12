// src/components/ruleBookComponents/PageSlide.jsx
import React, { memo, useMemo, useState } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Collapse,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Info, ChevronDown, Sparkles } from 'lucide-react'

const MotionBox = motion(Box)

const ListItem = memo(({ item, index, isMobile }) => {
  const [isOpen, setIsOpen] = useState(false)

  const animation = useMemo(
    () => ({
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      transition: { delay: 0.1 + (index * 0.05), type: 'spring', stiffness: 100 },
    }),
    [index],
  )

  return (
    <MotionBox {...animation} position="relative" mb={{ base: 4, md: 6 }}>
      {/* 
        Instead of a heavy box, we use a delicate layout. 
        When open, a subtle blur backdrop and glowing left border appears.
      */}
      <Box
        onClick={() => item.hasDetails && setIsOpen(!isOpen)}
        cursor={item.hasDetails ? 'pointer' : 'default'}
        p={isMobile ? 4 : 5}
        borderRadius="2xl"
        bg={isOpen ? 'rgba(30, 41, 59, 0.4)' : 'transparent'}
        backdropFilter={isOpen ? 'blur(10px)' : 'none'}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        position="relative"
        overflow="hidden"
        role="group"
        _hover={item.hasDetails ? {
          bg: 'rgba(30, 41, 59, 0.6)',
          transform: 'translateX(4px)'
        } : {}}
      >
        {/* Delicate Left Border Glow */}
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          w="4px"
          bg={isOpen ? 'cyan.400' : 'whiteAlpha.200'}
          borderRadius="full"
          transition="all 0.3s"
          _groupHover={item.hasDetails ? { bg: 'cyan.300', boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)' } : {}}
        />

        <HStack spacing={4} align="flex-start" pl={2}>
          <Box mt={1}>
            <Icon
              as={Info}
              w={isMobile ? 5 : 6}
              h={isMobile ? 5 : 6}
              color={isOpen ? 'cyan.300' : 'whiteAlpha.400'}
              transition="color 0.2s"
              _groupHover={item.hasDetails ? { color: 'cyan.200' } : {}}
            />
          </Box>

          <Box flex={1}>
            <Text 
              fontSize={{ base: 'md', md: 'xl' }} 
              color={isOpen ? 'white' : 'whiteAlpha.900'} 
              fontWeight={isOpen ? '600' : '400'}
              letterSpacing="wide"
              lineHeight="1.5"
              transition="all 0.2s"
            >
              {item.text}
            </Text>

            {item.hasDetails && (
              <Collapse in={isOpen} animateOpacity>
                <Box mt={4} pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
                  <Text
                    color="whiteAlpha.700"
                    fontSize={{ base: 'sm', md: 'md' }}
                    lineHeight="1.8"
                    letterSpacing="wide"
                  >
                    {item.explanation}
                  </Text>
                </Box>
              </Collapse>
            )}
          </Box>

          {item.hasDetails && (
            <Icon
              as={ChevronDown}
              w={5}
              h={5}
              mt={1}
              color={isOpen ? 'cyan.400' : 'whiteAlpha.300'}
              transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            />
          )}
        </HStack>
      </Box>
    </MotionBox>
  )
})

const Section = memo(({ subtitle, items, isMobile, sectionIndex }) => (
  <MotionBox 
    mb={{ base: 12, md: 16 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: sectionIndex * 0.1, duration: 0.5 }}
  >
    {/* Clean, editorial section header */}
    <HStack spacing={3} mb={6} align="center">
      <Box p={2} bg="rgba(34, 211, 238, 0.1)" borderRadius="lg">
        <Icon as={Sparkles} color="cyan.400" w={5} h={5} />
      </Box>
      <Text
        color="white"
        fontWeight="800"
        fontSize={{ base: '2xl', md: '3xl' }}
        fontFamily="'Outfit', sans-serif"
        letterSpacing="tight"
      >
        {subtitle}
      </Text>
    </HStack>

    <VStack spacing={0} align="stretch" pl={{ base: 0, md: 2 }}>
      {items.map((item, i) => (
        <ListItem key={i} item={item} index={i} isMobile={isMobile} />
      ))}
    </VStack>
  </MotionBox>
))

const PageSlide = ({ content, title }) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  const slideAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  }

  return (
    <MotionBox
      {...slideAnimation}
      w="full"
      position="relative"
    >
      {/* 
        We removed the heavy border/background wrapper entirely.
        This provides a clean, editorial reading experience.
      */}
      <Box 
        pt={{ base: 4, md: 0 }}
        pb={24} // Extra padding for the bottom mobile nav
      >
        <Text
          fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
          fontWeight="900"
          color="white"
          fontFamily="'Outfit', sans-serif"
          letterSpacing="tight"
          mb={{ base: 10, md: 16 }}
          lineHeight="1.1"
        >
          {title}
        </Text>

        {Object.entries(content).map(([subtitle, items], index) => (
          <Section
            key={subtitle}
            subtitle={subtitle}
            items={items}
            isMobile={isMobile}
            sectionIndex={index}
          />
        ))}
      </Box>
    </MotionBox>
  )
}

export default memo(PageSlide)

// src/components/ruleBookComponents/DropdownMenu.jsx
import React from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  useDisclosure,
  Icon,
  HStack,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react'

const MotionBox = motion(Box)
const MotionText = motion(Text)

const MenuItem = ({ page, isCurrentPage, onSelect, index, onToggle }) => {
  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.3,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    hover: {
      x: 5,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <MotionBox
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      cursor="pointer"
      position="relative"
      role="group"
      onClick={() => {
        onSelect(page.id)
        onToggle()
      }}
    >
      {/* Hover Highlight */}
      <Box
        position="absolute"
        left={0}
        right={0}
        top={0}
        bottom={0}
        bg="linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 50%, transparent 100%)"
        opacity={0}
        transition="opacity 0.2s"
        _groupHover={{ opacity: 1 }}
      />

      {/* Active Indicator */}
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="3px"
        bg="pink.400"
        transform={isCurrentPage ? 'scaleY(1)' : 'scaleY(0)'}
        transition="transform 0.2s"
        _groupHover={{ transform: 'scaleY(1)' }}
      />

      <HStack
        spacing={4}
        py={4}
        px={6}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Box flex={1}>
          <HStack mb={1} spacing={2}>
            {isCurrentPage && (
              <Icon as={Sparkles} w={4} h={4} color="pink.300" />
            )}
            <Text
              color={isCurrentPage ? 'pink.300' : 'white'}
              fontWeight="medium"
              fontSize="md"
            >
              {page.title}
            </Text>
          </HStack>

          <Text
            fontSize="sm"
            color="whiteAlpha.600"
            pl={isCurrentPage ? 6 : 0}
            transition="padding 0.2s"
          >
            {Object.keys(page.content).length} sections
          </Text>
        </Box>

        <Icon
          as={ChevronRight}
          w={5}
          h={5}
          color="pink.300"
          opacity={0}
          transform="translateX(-10px)"
          transition="all 0.2s"
          _groupHover={{
            opacity: 1,
            transform: 'translateX(0)',
          }}
        />
      </HStack>
    </MotionBox>
  )
}

const DropdownButton = ({ isOpen, onToggle, currentPage }) => (
  <Button
    onClick={onToggle}
    w="full"
    bg="rgba(20, 17, 35, 0.7)"
    border="1px solid"
    borderColor={isOpen ? 'pink.400' : 'whiteAlpha.200'}
    _hover={{
      borderColor: 'pink.400',
      bg: 'rgba(20, 17, 35, 0.9)',
    }}
    p={0}
    color="white"
    rounded="2xl"
    position="relative"
    overflow="hidden"
    transition="all 0.2s"
    height="auto"
    role="group"
  >
    {/* Gradient Border Effect */}
    <Box
      position="absolute"
      inset={0}
      padding="1px"
      borderRadius="2xl"
      bgGradient={
        isOpen
          ? 'linear(to-r, pink.400, purple.400)'
          : 'linear(to-r, transparent, transparent)'
      }
      opacity={isOpen ? 1 : 0}
      transition="all 0.3s"
      _groupHover={{ opacity: 1 }}
    >
      <Box bg="rgba(20, 17, 35, 0.95)" w="full" h="full" borderRadius="2xl" />
    </Box>

    {/* Content Container */}
    <HStack
      width="full"
      justify="space-between"
      align="center"
      position="relative"
      px={6}
      py={4}
      spacing={4}
    >
      {/* Text Content */}
      <VStack align="flex-start" spacing={1}>
        <Text
          fontSize="sm"
          color="purple.300"
          textTransform="uppercase"
          letterSpacing="wider"
          opacity={0.9}
        >
          Current Section
        </Text>
        <MotionText
          fontSize="lg"
          fontWeight="semibold"
          color={isOpen ? 'pink.300' : 'white'}
          animate={{
            x: isOpen ? 5 : 0,
            transition: { duration: 0.2 },
          }}
        >
          {currentPage.title}
        </MotionText>
      </VStack>

      {/* Chevron Icon */}
      <MotionBox
        animate={{
          rotate: isOpen ? 180 : 0,
          scale: isOpen ? 1.2 : 1,
        }}
        transition={{
          duration: 0.4,
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
      >
        <Box
          as={ChevronDown}
          size={24}
          color={isOpen ? 'pink.400' : 'whiteAlpha.700'}
          transition="color 0.2s"
          _groupHover={{ color: 'pink.400' }}
        />
      </MotionBox>
    </HStack>

    {/* Highlight Effect on Hover */}
    <Box
      position="absolute"
      inset={0}
      bgGradient="linear(to-r, pink.500/5, transparent 50%)"
      opacity={0}
      transition="opacity 0.3s"
      _groupHover={{ opacity: 1 }}
    />
  </Button>
)

const DropdownMenu = ({ pages, currentPage, onSelect }) => {
  const { isOpen, onToggle } = useDisclosure()

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <Box position="relative" mb={6}>
      <DropdownButton
        onToggle={onToggle}
        currentPage={currentPage}
        isOpen={isOpen}
      />

      <AnimatePresence>
        {isOpen && (
          <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            position="absolute"
            top="calc(100% + 8px)"
            left={0}
            right={0}
            bg="rgba(20, 17, 35, 0.95)"
            backdropFilter="blur(12px)"
            borderRadius="xl"
            overflow="hidden"
            zIndex={10}
            border="1px solid"
            borderColor="whiteAlpha.200"
            boxShadow="0 4px 20px rgba(236, 72, 153, 0.1)"
          >
            <VStack spacing={0} align="stretch">
              {pages.map((page, index) => (
                <MenuItem
                  key={page.id}
                  page={page}
                  isCurrentPage={currentPage.id === page.id}
                  onSelect={onSelect}
                  index={index}
                  onToggle={onToggle}
                />
              ))}
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default DropdownMenu

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
  Portal,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronRight, Zap, X, Map } from 'lucide-react'

const MotionBox = motion(Box)

const MenuItem = ({ page, isCurrentPage, onSelect, index, isDesktop }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      cursor="pointer"
      position="relative"
      role="group"
      onClick={() => onSelect(page.id)}
      p={4}
      mb={2}
      borderRadius="xl"
      bg={isCurrentPage ? 'rgba(34, 211, 238, 0.1)' : 'transparent'}
      border="1px solid"
      borderColor={isCurrentPage ? 'cyan.500' : 'transparent'}
      transition="all 0.2s"
    >
      <HStack spacing={4}>
        <Box 
          p={2} 
          borderRadius="lg" 
          bg={isCurrentPage ? 'cyan.400' : 'whiteAlpha.100'} 
          color={isCurrentPage ? 'gray.900' : 'whiteAlpha.500'}
          transition="all 0.2s"
          _groupHover={{ bg: isCurrentPage ? 'cyan.400' : 'whiteAlpha.200', color: isCurrentPage ? 'gray.900' : 'white' }}
        >
          {isCurrentPage ? <Zap size={18} /> : <Map size={18} />}
        </Box>
        
        <Box flex={1}>
          <Text
            color={isCurrentPage ? 'cyan.300' : 'whiteAlpha.800'}
            fontWeight={isCurrentPage ? 'bold' : 'medium'}
            fontSize="md"
            fontFamily="'Outfit', sans-serif"
            _groupHover={{ color: 'white' }}
            transition="color 0.2s"
          >
            {page.title}
          </Text>
        </Box>

        {!isDesktop && (
          <Icon
            as={ChevronRight}
            w={5}
            h={5}
            color={isCurrentPage ? 'cyan.400' : 'whiteAlpha.400'}
            opacity={isCurrentPage ? 1 : 0}
            transform="translateX(-5px)"
            transition="all 0.2s"
            _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
          />
        )}
      </HStack>
    </MotionBox>
  )
}

const DropdownMenu = ({ pages, currentPage, onSelect, isDesktopSidebar }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  // 1. DESKTOP SIDEBAR VIEW
  if (isDesktopSidebar) {
    return (
      <Box w="full">
        <Text 
          color="whiteAlpha.500" 
          fontSize="xs" 
          textTransform="uppercase" 
          letterSpacing="widest" 
          mb={6} 
          fontWeight="bold"
          pl={4}
        >
          Documentation
        </Text>
        <VStack spacing={1} align="stretch">
          {pages.map((page, index) => (
            <MenuItem
              key={page.id}
              page={page}
              isCurrentPage={currentPage.id === page.id}
              onSelect={onSelect}
              index={index}
              isDesktop={true}
            />
          ))}
        </VStack>
      </Box>
    )
  }

  // 2. MOBILE BOTTOM SHEET VIEW
  return (
    <>
      {/* Floating Pill Button at bottom of screen */}
      <Button
        onClick={onOpen}
        w="full"
        bg="rgba(15, 23, 42, 0.6)"
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor="whiteAlpha.200"
        shadow="0 10px 40px rgba(0,0,0,0.5)"
        _hover={{ bg: 'rgba(30, 41, 59, 0.8)' }}
        _active={{ bg: 'rgba(30, 41, 59, 0.9)' }}
        h="auto"
        py={4}
        px={6}
        rounded="2xl"
        justifyContent="space-between"
      >
        <VStack align="flex-start" spacing={0}>
          <Text fontSize="xs" color="cyan.400" textTransform="uppercase" letterSpacing="widest" fontWeight="bold">
            Current Topic
          </Text>
          <Text fontSize="md" color="white" fontWeight="700" fontFamily="'Outfit', sans-serif">
            {currentPage.title}
          </Text>
        </VStack>
        <Box
          p={2}
          bg="whiteAlpha.100"
          borderRadius="full"
          color="white"
        >
          <ChevronUp size={20} />
        </Box>
      </Button>

      {/* Bottom Sheet Modal */}
      <AnimatePresence>
        {isOpen && (
          <Portal>
            {/* Backdrop */}
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              position="fixed"
              inset={0}
              bg="rgba(0,0,0,0.6)"
              backdropFilter="blur(10px)"
              zIndex={100}
              onClick={onClose}
            />
            
            {/* Sheet */}
            <MotionBox
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              position="fixed"
              bottom={0}
              left={0}
              right={0}
              bg="rgba(15, 23, 42, 0.85)"
              backdropFilter="blur(30px)"
              borderTopRadius="3xl"
              borderTop="1px solid"
              borderColor="whiteAlpha.200"
              zIndex={101}
              p={6}
              pb={10}
              maxH="85vh"
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': { width: '0' },
                scrollbarWidth: 'none',
              }}
            >
              <Box w="40px" h="4px" bg="whiteAlpha.300" borderRadius="full" mx="auto" mb={6} />
              
              <HStack justify="space-between" align="center" mb={6}>
                <Text fontSize="2xl" fontWeight="800" color="white" fontFamily="'Outfit', sans-serif">
                  Topics
                </Text>
                <Button size="sm" variant="ghost" color="whiteAlpha.500" onClick={onClose} rounded="full">
                  <X size={20} />
                </Button>
              </HStack>

              <VStack spacing={2} align="stretch">
                {pages.map((page, index) => (
                  <MenuItem
                    key={page.id}
                    page={page}
                    isCurrentPage={currentPage.id === page.id}
                    onSelect={(id) => {
                      onSelect(id)
                      onClose()
                    }}
                    index={index}
                    isDesktop={false}
                  />
                ))}
              </VStack>
            </MotionBox>
          </Portal>
        )}
      </AnimatePresence>
    </>
  )
}

export default DropdownMenu

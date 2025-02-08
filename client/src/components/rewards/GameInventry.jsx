import React, { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  Badge,
  IconButton,
  Heading,
  HStack,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerHeader,
  Container,
} from '@chakra-ui/react'
import {
  Package,
  Star,
  Target,
  Zap,
  Crown,
  Trophy,
  Shield,
  Gift,
  Clock,
  Sparkle,
  ChevronLeft,
} from 'lucide-react'

const GameInventory = ({ isOpen, inventory, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('boost')
  const [selectedItem, setSelectedItem] = useState(null)

  const filters = [
    { id: 'boost', name: 'Boosts', icon: <Zap /> },
    { id: 'powerup', name: 'Power-Ups', icon: <Crown /> },
    { id: 'badge', name: 'Badges', icon: <Shield /> },
  ]

  const getRarityStyle = rarity => {
    switch (rarity) {
      case 'legendary':
        return {
          bgGradient: 'linear(to-br, yellow.400, orange.500)',
          shadow: 'lg',
        }
      case 'epic':
        return {
          bgGradient: 'linear(to-br, purple.400, pink.600)',
          shadow: 'lg',
        }
      case 'rare':
        return {
          bgGradient: 'linear(to-br, blue.400, cyan.600)',
          shadow: 'lg',
        }
      default:
        return {
          bgGradient: 'linear(to-br, gray.400, gray.600)',
          shadow: 'lg',
        }
    }
  }

  return (
    <>
      {/* Drawer */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent
          bgGradient="linear(to-br, gray.900, gray.800)"
          color="white"
        >
          <IconButton
            icon={<ChevronLeft />}
            position="absolute"
            left="4"
            top="4"
            onClick={onClose}
            variant="ghost"
            color="white"
            zIndex="1"
          />

          <DrawerHeader borderBottomWidth="1px" borderColor="gray.700">
            <Heading
              textAlign="center"
              bgGradient="linear(to-r, yellow.200, yellow.500)"
              bgClip="text"
              fontSize="2xl"
            >
              Treasure Vault
            </Heading>
            <HStack overflowX="auto" py="2" spacing="2">
              {filters.map(filter => (
                <Button
                  key={filter.id}
                  onClick={() => setSelectedCategory(filter.id)}
                  bgGradient={
                    selectedCategory === filter.id
                      ? 'linear(to-r, blue.500, purple.500)'
                      : ''
                  }
                  bg={selectedCategory !== filter.id ? 'gray.800' : ''}
                  _hover={{
                    bg: selectedCategory !== filter.id ? 'gray.700' : '',
                  }}
                  leftIcon={filter.icon}
                  size="sm"
                  whiteSpace="nowrap"
                  color={'white'}
                >
                  {filter.name}
                </Button>
              ))}
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <Grid templateColumns="repeat(2, 1fr)" gap="3" py="4">
              {inventory
                .filter(
                  item =>
                    selectedCategory === 'all' ||
                    item.type === selectedCategory,
                )
                .map(item => (
                  <Box
                    key={item.id}
                    {...getRarityStyle(item.rarity)}
                    p="33"
                    rounded="lg"
                    position="relative"
                    cursor="pointer"
                    onClick={() => setSelectedItem(item)}
                    transition="transform 0.2s"
                    _hover={{ transform: 'scale(1.05)' }}
                  >
                    <Box
                      position="absolute"
                      inset="0"
                      bg="blackAlpha.300"
                      rounded="lg"
                    />
                    <VStack position="relative" spacing="2">
                      <Flex
                        bg="blackAlpha.300"
                        p="2"
                        rounded="full"
                        justify="center"
                        align="center"
                      >
                        {item.icon}
                      </Flex>
                      <Text fontSize="xs" fontWeight="bold" textAlign="center">
                        {item.name}
                      </Text>
                      <Badge
                        position="absolute"
                        top="-1"
                        right="-1"
                        bg="blackAlpha.500"
                        px="2"
                        rounded="full"
                        color="yellow"
                      >
                        x{item.count}
                      </Badge>
                    </VStack>
                  </Box>
                ))}
            </Grid>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Item Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.800" />
        <ModalContent
          {...(selectedItem && getRarityStyle(selectedItem.rarity))}
          maxW="sm"
          p="6"
          color="white"
        >
          {selectedItem && (
            <Flex direction="column">
              <Flex gap="4" mb="4">
                <Flex
                  bg="blackAlpha.300"
                  p="3"
                  rounded="full"
                  justify="center"
                  align="center"
                >
                  {selectedItem.icon}
                </Flex>
                <Box flex="1">
                  <Text fontSize="xl" fontWeight="bold">
                    {selectedItem.name}
                  </Text>
                  <Text fontSize="sm" opacity="0.8" textTransform="capitalize">
                    {selectedItem.type} • {selectedItem.rarity}
                  </Text>
                </Box>
                <Badge bg="blackAlpha.300" px="3" py="1" rounded="full">
                  x{selectedItem.count}
                </Badge>
              </Flex>
              <Text fontSize="sm" opacity="0.9" mb="4">
                {selectedItem.description}
              </Text>
              <Button
                onClick={() => {
                  console.log('Claiming item:', selectedItem)
                  setSelectedItem(null)
                }}
                bg="green.500"
                _hover={{ bg: 'green.600' }}
                color="white"
                w="full"
              >
                Claim Reward
              </Button>
            </Flex>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default GameInventory

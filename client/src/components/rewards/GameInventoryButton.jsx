import { Badge, Box, Button, useDisclosure } from '@chakra-ui/react'
import { Package } from 'lucide-react'
import React from 'react'
import GameInventory from './GameInventory'
import { useSelector } from 'react-redux'

const GameInventoryButton = ({ page }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { availableAbilities } = useSelector(state => state.inventory)
  return (
    <>
      {/* Game Inventory Button */}
      <Box
        position="fixed"
        bottom={page === 'HOME' ? '20' : '14'}
        right="4"
        zIndex="999"
      >
        <Button
          onClick={onOpen}
          bgGradient="linear(to-r, blue.500, purple.500)"
          _hover={{
            bgGradient: 'linear(to-r, blue.600, purple.600)',
            transform: 'scale(1.05)',
          }}
          color="white"
          leftIcon={<Package />}
          position="relative"
          transition="all 0.3s"
          rounded="full"
          px="4"
          py="6"
        >
          Treasure Vault
          {availableAbilities.length != 0 && (
            <Badge
              position="absolute"
              top="-2"
              right="-2"
              bg="red.500"
              color="white"
              rounded="full"
              w="6"
              h="6"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {availableAbilities.length}
            </Badge>
          )}
        </Button>
      </Box>

      <GameInventory isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default GameInventoryButton

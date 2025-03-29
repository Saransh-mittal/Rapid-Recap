// components/quickClashComponents/RevengeConfirmationDialog.jsx
import React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  HStack,
  Icon,
  Flex,
  Badge,
  Spinner,
  VStack,
  Progress,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Flame, Swords, AlertCircle } from 'lucide-react'

const MotionButton = motion(Button)

/**
 * Confirmation dialog specifically for revenge challenges with enhanced loading states
 */
const RevengeConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  opponentName,
  category,
  isLoading,
  loadingProgress, // Optional prop for showing progress updates
}) => {
  const cancelRef = React.useRef()

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose} // Prevent closing during loading
      motionPreset="slideInBottom"
      isCentered
      closeOnOverlayClick={!isLoading} // Prevent closing by clicking outside when loading
      closeOnEsc={!isLoading} // Prevent escape key closing when loading
    >
      <AlertDialogOverlay>
        <AlertDialogContent
          bg="rgba(26, 32, 44, 0.95)"
          borderWidth="1px"
          borderColor="red.500"
          borderRadius="xl"
          boxShadow="0 0 20px rgba(229, 62, 62, 0.4)"
          p={1}
          mx={4}
        >
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            color="white"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Icon as={Flame} color="red.400" boxSize={6} />
            {isLoading ? 'Creating Revenge Challenge...' : 'Seek Revenge?'}
          </AlertDialogHeader>

          <AlertDialogBody color="whiteAlpha.800">
            {isLoading ? (
              <VStack spacing={4} py={2}>
                <Spinner
                  size="xl"
                  color="red.400"
                  thickness="4px"
                  speed="0.8s"
                  emptyColor="whiteAlpha.200"
                />

                <Text textAlign="center" fontWeight="medium">
                  Preparing your revenge challenge against{' '}
                  <Text as="span" color="white" fontWeight="bold">
                    {opponentName}
                  </Text>
                </Text>

                <Text fontSize="sm" color="whiteAlpha.700" textAlign="center">
                  This may take 10-30 seconds. Please don't close this window.
                </Text>

                {loadingProgress && (
                  <>
                    <Progress
                      value={loadingProgress}
                      size="sm"
                      colorScheme="red"
                      width="100%"
                      borderRadius="full"
                      hasStripe
                      isAnimated
                    />
                    <Text
                      fontSize="xs"
                      color="whiteAlpha.600"
                      textAlign="center"
                    >
                      Generating challenge questions...
                    </Text>
                  </>
                )}
              </VStack>
            ) : (
              <>
                <Text mb={4}>
                  Challenge{' '}
                  <Text as="span" fontWeight="bold" color="white">
                    {opponentName}
                  </Text>{' '}
                  to a revenge battle in the same category.
                </Text>

                <Flex align="center" justify="center" my={4}>
                  <Badge
                    colorScheme="purple"
                    p={2}
                    borderRadius="md"
                    fontSize="md"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Icon as={Swords} />
                    {category}
                  </Badge>
                </Flex>

                <HStack spacing={2} color="orange.300" my={3} fontSize="sm">
                  <Icon as={AlertCircle} boxSize={4} />
                  <Text>
                    Creating a revenge challenge may take 10-30 seconds.
                  </Text>
                </HStack>

                <Text fontSize="sm" color="whiteAlpha.600">
                  This action will create a new challenge immediately.
                </Text>
              </>
            )}
          </AlertDialogBody>

          <AlertDialogFooter>
            <HStack spacing={3}>
              <Button
                ref={cancelRef}
                onClick={onClose}
                variant="ghost"
                color="whiteAlpha.700"
                _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
              >
                {isLoading ? 'Close' : 'Cancel'}
              </Button>

              {isLoading ? (
                <Button
                  colorScheme="gray"
                  isDisabled={true}
                  loadingText="Creating Challenge..."
                  cursor="not-allowed"
                  opacity={0.7}
                >
                  Please Wait
                </Button>
              ) : (
                <MotionButton
                  colorScheme="red"
                  onClick={onConfirm}
                  leftIcon={<Flame />}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  _hover={{ bg: 'red.500' }}
                >
                  Seek Revenge
                </MotionButton>
              )}
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default RevengeConfirmationDialog

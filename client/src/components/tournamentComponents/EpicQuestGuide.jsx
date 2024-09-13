import React, { lazy, Suspense, useMemo, useCallback } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Flex,
  Button,
  useDisclosure,
  useTheme,
  Spinner,
} from '@chakra-ui/react'
import { FaQuestionCircle, FaLightbulb, FaInfoCircle } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const MotionButton = motion(Button)

// Lazy load TournamentGuideModal for code splitting
const TournamentGuideModal = lazy(() => import('./TournamentGuideModal'))

const EpicQuestGuide = () => {
  const { t } = useTranslation('EpicQuestGuide')
  const theme = useTheme()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Memoize static styles to avoid re-calculation
  const bgColor = useMemo(() => 'rgba(0, 0, 0, 0.3)', [])
  const borderColor = useMemo(() => 'pink.700', [])
  const questionColor = useMemo(() => 'white', [])
  const answerColor = useMemo(() => 'gray.300', [])
  const iconColor = useMemo(() => 'pink.400', [])

  // Memoize guide instructions
  const guideInstructions = useMemo(
    () => t('questions', { returnObjects: true }),
    [t],
  )

  // Memoize onOpen and onClose to avoid re-renders of the MotionButton
  const handleOpen = useCallback(onOpen, [])
  const handleClose = useCallback(onClose, [])

  // Memoize animation properties for MotionButton
  const buttonAnimationProps = useMemo(
    () => ({
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      transition: { type: 'spring', stiffness: 500, damping: 30 },
    }),
    [],
  )

  return (
    <Box minHeight="100vh" pb={12} borderRadius="xl">
      <Container maxWidth="800px">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading
              size="2xl"
              bgGradient="linear(to-r, pink.400, purple.400)"
              bgClip="text"
              letterSpacing="tight"
            >
              {t('title')}
            </Heading>
            <Text mt={2} fontSize="lg" color="gray.400">
              {t('subtitle')}
            </Text>
          </Box>

          <Accordion allowMultiple>
            {guideInstructions.map((instruction, index) => (
              <AccordionItem
                key={index}
                border="none"
                mb={4}
                borderRadius="lg"
                boxShadow="dark-lg"
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                overflow="hidden"
              >
                <h2>
                  <AccordionButton
                    _expanded={{ bg: 'rgba(236, 72, 153, 0.2)' }}
                    _hover={{ bg: 'rgba(236, 72, 153, 0.1)' }}
                  >
                    <Flex flex="1" textAlign="left" alignItems="center">
                      <Icon
                        as={FaQuestionCircle}
                        boxSize={6}
                        color={iconColor}
                        mr={4}
                      />
                      <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        color={questionColor}
                      >
                        {instruction.question}
                      </Text>
                    </Flex>
                    <AccordionIcon color={iconColor} />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Flex alignItems="flex-start">
                    <Icon
                      as={FaLightbulb}
                      boxSize={5}
                      color={iconColor}
                      mr={4}
                      mt={1}
                    />
                    <Text fontSize="md" color={answerColor}>
                      {instruction.answer}
                    </Text>
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>

          <MotionButton
            onClick={handleOpen}
            leftIcon={<FaInfoCircle />}
            bg="linear-gradient(45deg, #FF00EA, #8A2BE2)"
            color="white"
            borderRadius="full"
            px={6}
            py={3}
            fontSize="lg"
            fontWeight="bold"
            _hover={{
              bg: 'linear-gradient(45deg, #FF00EA, #8A2BE2)',
              opacity: 0.9,
              transform: 'scale(1.05)',
            }}
            _active={{
              bg: 'linear-gradient(45deg, #FF00EA, #8A2BE2)',
              transform: 'scale(0.95)',
            }}
            boxShadow={`0 0 20px ${theme.colors.pink[400]}40`}
            {...buttonAnimationProps}
          >
            Know More
          </MotionButton>
        </VStack>
      </Container>

      <Suspense fallback={<Spinner />}>
        <TournamentGuideModal isOpen={isOpen} onClose={handleClose} />
      </Suspense>
    </Box>
  )
}

export default EpicQuestGuide

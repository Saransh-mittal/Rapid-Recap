import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  Button,
  Center,
  Icon,
  HStack,
  Flex,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  BrainCog,
  Clock,
  Award,
  CheckCircle,
  Star,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)
const MotionButton = motion(Button)

const QuizInstructions = ({ onStart }) => {
  const { t } = useTranslation('QuickClash')
  const isSmallScreen = useBreakpointValue({ base: true, md: false })

  return (
    <Center minH="calc(100vh - 200px)" py={6}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        maxW="700px"
        w="100%"
        p={{ base: 4, md: 8 }}
        borderRadius="xl"
        bg="rgba(26, 32, 44, 0.7)"
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor="purple.500"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.25)"
      >
        <VStack spacing={6} align="stretch">
          <Flex justify="center">
            <MotionIcon
              as={BrainCog}
              boxSize={{ base: 10, md: 14 }}
              color="yellow.400"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            />
          </Flex>

          <MotionHeading
            textAlign="center"
            bgGradient="linear(to-r, yellow.400, orange.300)"
            bgClip="text"
            fontWeight="bold"
            size={{ base: 'lg', md: 'xl' }}
            mb={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {t('Quiz Challenge Instructions')}
          </MotionHeading>

          <MotionText
            color="gray.300"
            fontSize={{ base: 'sm', md: 'md' }}
            textAlign="center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {t(
              "It's time to test your knowledge! Get ready for the quiz challenge.",
            )}
          </MotionText>

          <Flex
            wrap="wrap"
            justifyContent="center"
            gap={4}
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Box
              bg="rgba(255, 255, 255, 0.05)"
              p={4}
              borderRadius="md"
              boxShadow="inset 0 1px 2px rgba(255, 255, 255, 0.1)"
              flex="1"
              minW={{ base: '100%', md: '180px' }}
              maxW={{ base: '100%', md: '200px' }}
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{ bg: 'rgba(255, 255, 255, 0.07)' }}
              transition="all 0.2s"
            >
              <VStack>
                <Icon as={Clock} color="yellow.400" boxSize={8} />
                <Text fontWeight="medium" color="white">
                  {t('Time Limit')}
                </Text>
                <Text
                  as="span"
                  color="yellow.300"
                  fontSize="lg"
                  fontWeight="bold"
                >
                  50 {t('seconds')}
                </Text>
              </VStack>
            </Box>

            <Box
              bg="rgba(255, 255, 255, 0.05)"
              p={4}
              borderRadius="md"
              boxShadow="inset 0 1px 2px rgba(255, 255, 255, 0.1)"
              flex="1"
              minW={{ base: '100%', md: '180px' }}
              maxW={{ base: '100%', md: '200px' }}
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{ bg: 'rgba(255, 255, 255, 0.07)' }}
              transition="all 0.2s"
            >
              <VStack>
                <Icon as={Award} color="yellow.400" boxSize={8} />
                <Text fontWeight="medium" color="white">
                  {t('Questions')}
                </Text>
                <Text
                  as="span"
                  color="yellow.300"
                  fontSize="lg"
                  fontWeight="bold"
                >
                  5 {t('questions')}
                </Text>
              </VStack>
            </Box>

            <Box
              bg="rgba(255, 255, 255, 0.05)"
              p={4}
              borderRadius="md"
              boxShadow="inset 0 1px 2px rgba(255, 255, 255, 0.1)"
              flex="1"
              minW={{ base: '100%', md: '180px' }}
              maxW={{ base: '100%', md: '200px' }}
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{ bg: 'rgba(255, 255, 255, 0.07)' }}
              transition="all 0.2s"
            >
              <VStack>
                <Icon as={Star} color="yellow.400" boxSize={8} />
                <Text fontWeight="medium" color="white">
                  {t('Scoring')}
                </Text>
                <Text
                  as="span"
                  color="yellow.300"
                  textAlign="center"
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  {t('Accuracy + Speed')}
                </Text>
              </VStack>
            </Box>
          </Flex>

          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            bg="rgba(255, 255, 255, 0.03)"
            borderRadius="lg"
            p={4}
            borderLeft="4px solid"
            borderColor="yellow.400"
          >
            <HStack align="flex-start" spacing={3}>
              <Icon as={Lightbulb} color="yellow.400" boxSize={5} mt={1} />
              <Box>
                <Text fontWeight="medium" color="yellow.200" mb={2}>
                  {t('Quick Tips')}:
                </Text>
                <UnorderedList
                  color="gray.300"
                  spacing={2}
                  pl={2}
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  <ListItem>{t('Read each question carefully')}</ListItem>
                  <ListItem>
                    {t('Use the navigation buttons to move between questions')}
                  </ListItem>
                  <ListItem>
                    {t("You can come back to questions if you're unsure")}
                  </ListItem>
                  <ListItem>
                    {t('The timer in the header shows your remaining time')}
                  </ListItem>
                </UnorderedList>
              </Box>
            </HStack>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            textAlign="center"
            mt={4}
          >
            <MotionButton
              colorScheme="yellow"
              size="lg"
              onClick={onStart}
              px={10}
              rightIcon={<ArrowRight />}
              whileHover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              whileTap={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
              bgGradient="linear(to-r, yellow.400, orange.400)"
              _hover={{ bgGradient: 'linear(to-r, yellow.500, orange.500)' }}
              _active={{ bgGradient: 'linear(to-r, yellow.600, orange.600)' }}
              boxShadow="0 4px 15px rgba(255, 186, 8, 0.4)"
            >
              {t('Begin Challenge')}
            </MotionButton>
          </MotionBox>
        </VStack>
      </MotionBox>
    </Center>
  )
}

export default QuizInstructions

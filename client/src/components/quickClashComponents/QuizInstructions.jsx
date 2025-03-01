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
  Divider,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  BrainCog,
  Clock,
  Award,
  CheckCircle,
  Sparkles,
  Zap,
  LightbulbIcon,
  Trophy,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QuickClashBackground from './QuickClashBackground'

const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)
const MotionFlex = motion(Flex)

const InstructionItem = ({ icon, title, description, delay = 0 }) => (
  <MotionBox
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    mb={4}
  >
    <HStack
      spacing={4}
      p={4}
      bg="whiteAlpha.100"
      borderRadius="md"
      borderLeftWidth="3px"
      borderLeftColor="purple.400"
    >
      <Center
        boxSize="40px"
        bg="whiteAlpha.200"
        borderRadius="md"
        color="purple.300"
      >
        <Icon as={icon} />
      </Center>
      <Box>
        <Text fontWeight="bold" color="whiteAlpha.900">
          {title}
        </Text>
        <Text color="whiteAlpha.800" fontSize="sm">
          {description}
        </Text>
      </Box>
    </HStack>
  </MotionBox>
)

const QuizInstructions = ({ onStart }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center minH="60vh" py={10}>
      <QuickClashBackground>
        <MotionBox
          maxW="800px"
          w="100%"
          p={8}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={8} align="stretch">
            <Center>
              <MotionIcon
                as={BrainCog}
                boxSize={16}
                color="purple.300"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
              />
            </Center>

            <MotionHeading
              textAlign="center"
              bgGradient="linear(to-r, purple.300, purple.500)"
              bgClip="text"
              fontWeight="bold"
              size="xl"
              mb={2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {t('Quiz Challenge Instructions')}
            </MotionHeading>

            <MotionText
              color="whiteAlpha.900"
              fontSize="md"
              textAlign="center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {t(
                "It's time to test your knowledge! Get ready for the quiz challenge.",
              )}
            </MotionText>

            <Divider borderColor="whiteAlpha.200" />

            <VStack align="stretch" spacing={4}>
              <InstructionItem
                icon={Clock}
                title={t('Time Limit')}
                description={t(
                  'You have 50 seconds to complete all questions. Use your time wisely!',
                )}
                delay={0.4}
              />

              <InstructionItem
                icon={Award}
                title={t('Questions')}
                description={t(
                  '5 questions will be presented. Answer as many as you can for the best score.',
                )}
                delay={0.5}
              />

              <InstructionItem
                icon={CheckCircle}
                title={t('Scoring')}
                description={t(
                  'Your score is based on both accuracy and speed. Faster correct answers earn more points.',
                )}
                delay={0.6}
              />

              <InstructionItem
                icon={Sparkles}
                title={t('Performance Bonus')}
                description={t(
                  'Perfect scores earn additional points. Challenge yourself to answer all correctly!',
                )}
                delay={0.7}
              />
            </VStack>

            <MotionBox
              bg="rgba(0,0,0,0.2)"
              p={5}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="purple.500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <HStack mb={3}>
                <Icon as={LightbulbIcon} color="yellow.300" />
                <Text color="yellow.200" fontWeight="medium">
                  {t('Pro Tips')}:
                </Text>
              </HStack>

              <UnorderedList color="whiteAlpha.900" spacing={2} pl={5}>
                <ListItem>
                  {t('Read each question carefully before answering')}
                </ListItem>
                <ListItem>
                  {t(
                    'Manage your time wisely - aim for both accuracy and speed',
                  )}
                </ListItem>
                <ListItem>
                  {t('Use the navigation buttons to move between questions')}
                </ListItem>
                <ListItem>
                  {t(
                    'You must select an answer before moving to the next question',
                  )}
                </ListItem>
                <ListItem>
                  {t(
                    'Submit your answers before time runs out for the best score',
                  )}
                </ListItem>
              </UnorderedList>
            </MotionBox>

            <Center>
              <MotionFlex
                direction="column"
                align="center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                mt={4}
              >
                <Badge
                  mb={4}
                  p={2}
                  borderRadius="md"
                  colorScheme="green"
                  bgGradient="linear(to-r, green.400, green.600)"
                >
                  <HStack spacing={2}>
                    <Icon as={Trophy} />
                    <Text>{t('Challenge your opponent!')}</Text>
                  </HStack>
                </Badge>

                <Button
                  leftIcon={<Zap />}
                  colorScheme="purple"
                  size="lg"
                  onClick={onStart}
                  px={10}
                  bgGradient="linear(to-r, purple.500, purple.700)"
                  _hover={{
                    bgGradient: 'linear(to-r, purple.600, purple.800)',
                  }}
                  boxShadow="0 4px 12px rgba(138, 43, 226, 0.3)"
                  as={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('Begin Challenge')}
                </Button>
              </MotionFlex>
            </Center>
          </VStack>
        </MotionBox>
      </QuickClashBackground>
    </Center>
  )
}

export default QuizInstructions

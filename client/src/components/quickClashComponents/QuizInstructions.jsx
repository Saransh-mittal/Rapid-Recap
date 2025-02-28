import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  Button,
  useColorModeValue,
  Center,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { BrainCog, Clock, Award, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)

const QuizInstructions = ({ onStart }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center minH="60vh" py={10}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        maxW="600px"
        w="100%"
        p={8}
        borderRadius="xl"
        bg="rgba(26, 32, 44, 0.7)"
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor="whiteAlpha.200"
        boxShadow="lg"
      >
        <VStack spacing={6} align="stretch">
          <Center>
            <MotionIcon
              as={BrainCog}
              boxSize={12}
              color="yellow.400"
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
            bgGradient="linear(to-r, yellow.400, orange.300)"
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
            color="gray.300"
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

          <VStack
            align="start"
            spacing={4}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            as={motion.div}
          >
            <HStack>
              <Icon as={Clock} color="yellow.400" boxSize={5} />
              <Text fontWeight="medium" color="white">
                {t('Time Limit')}:{' '}
                <Text as="span" color="yellow.300">
                  50 {t('seconds')}
                </Text>
              </Text>
            </HStack>

            <HStack>
              <Icon as={Award} color="yellow.400" boxSize={5} />
              <Text fontWeight="medium" color="white">
                {t('Questions')}:{' '}
                <Text as="span" color="yellow.300">
                  5 {t('questions')}
                </Text>
              </Text>
            </HStack>

            <HStack>
              <Icon as={CheckCircle} color="yellow.400" boxSize={5} />
              <Text fontWeight="medium" color="white">
                {t('Scoring')}: {t('Based on accuracy and speed')}
              </Text>
            </HStack>
          </VStack>

          <MotionText
            color="yellow.200"
            fontWeight="medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {t('Tips')}:
          </MotionText>

          <UnorderedList
            color="gray.300"
            spacing={2}
            pl={5}
            as={motion.ul}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <ListItem>{t('Read each question carefully')}</ListItem>
            <ListItem>{t('Manage your time wisely')}</ListItem>
            <ListItem>
              {t('Use the navigation buttons to move between questions')}
            </ListItem>
            <ListItem>
              {t("You can come back to questions if you're unsure")}
            </ListItem>
          </UnorderedList>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            textAlign="center"
            mt={4}
          >
            <Button
              colorScheme="yellow"
              size="lg"
              onClick={onStart}
              px={10}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
            >
              {t('Begin Challenge')}
            </Button>
          </MotionBox>
        </VStack>
      </MotionBox>
    </Center>
  )
}

const HStack = motion(Box)

export default QuizInstructions

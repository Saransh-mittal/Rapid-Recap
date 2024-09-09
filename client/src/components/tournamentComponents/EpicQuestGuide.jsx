import React from 'react'
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
  useColorModeValue,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { FaQuestionCircle, FaLightbulb } from 'react-icons/fa'

const guideInstructions = [
  {
    question: 'What is the Tournament Mode?',
    answer:
      'The tournament mode is a fun game where you answer questions on different topics to win points and see how you compare with others.',
  },
  {
    question: 'Who Can Play?',
    answer:
      "To join the tournament mode, you need to use the app for at least 5 days in a row. This makes sure you're ready to compete!",
  },
  {
    question: 'When Can I register for tournament?',
    answer:
      "You can register for tournament for the tournament between Monday and Friday, until 11 PM. Don't worry, you'll have plenty of time to get ready.",
  },
  {
    question: 'How to Choose Topics?',
    answer:
      'When signing up, you will pick 5 categories from a list like Sports, Technology, Health, and more. Plus an additional category named Current Affairs, is selected automatically.',
  },
  {
    question: 'When Does the Tournament Happen?',
    answer:
      'The tournament takes place on Saturday and Sunday. You can play anytime during these two days, so it is really flexible.',
  },
  {
    question: 'How Does the Quiz Work?',
    answer:
      'You will have to answer 5 questions for each topic you picked, plus the Current Affairs topic. But be quick – you have only 50 seconds for each set of questions!',
  },
  {
    question: 'How Can I See My Score?',
    answer:
      'After you finish, your score will show up on a special leaderboard. You can see how well you did compared to other players right away.',
  },
  {
    question: 'What Happens With Rankings?',
    answer:
      "Everyone's answers are scored and ranked. The best players will be at the top of the leaderboard, and everyone gets to see where they stand.",
  },
  {
    question: 'Where Do the Questions Come From?',
    answer:
      'The quiz questions will come from the 5 categories you have selected when signing up, plus the Current Affairs category, which are about things that happened worldwide in the past week. This keeps everything fresh and exciting!',
  },
  {
    question: 'Why Should I Play?',
    answer:
      'It is a great way to learn new things, challenge yourself, and compete with others. Plus, it is fun to see your name rise on the leaderboard!',
  },
]

const EpicQuestGuide = () => {
  const bgColor = 'rgba(0, 0, 0, 0.3)'
  const borderColor = 'pink.700'
  const questionColor = 'white'
  const answerColor = 'gray.300'
  const iconColor = 'pink.400'

  return (
    <Box
      // bgGradient="linear(to-br, gray.900, purple.900)"
      minHeight="100vh"
      pb={12}
      borderRadius={'xl'}
    >
      <Container maxWidth="800px">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading
              size="2xl"
              bgGradient="linear(to-r, pink.400, purple.400)"
              bgClip="text"
              letterSpacing="tight"
            >
              Epic Quest Guide
            </Heading>
            <Text mt={2} fontSize="lg" color="gray.400">
              Master the Tournament Mode
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
        </VStack>
      </Container>
    </Box>
  )
}

export default EpicQuestGuide

import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Flex,
  Circle,
  useTheme,
  Heading,
  Progress,
  Box,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTrophy,
  FaCalendarAlt,
  FaClipboardList,
  FaClock,
  FaMedal,
  FaGlobe,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionCircle = motion(Circle)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)

const TournamentGuideModal = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [direction, setDirection] = useState(0)
  const theme = useTheme()

  const bgGradient = `linear(to-br, ${theme.colors.gray[900]}, ${theme.colors.purple[900]})`

  const pages = [
    {
      title: 'Welcome to Rapid Recap Tournament!',
      icon: FaTrophy,
      content: (
        <VStack spacing={4} align="stretch">
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to the exciting world of Rapid Recap Tournament!
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            This weekend event is your chance to showcase your knowledge,
            compete with others, and have a blast while learning new things.
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Get ready for a thrilling quiz experience that covers various
            categories and keeps you up-to-date with current affairs!
          </MotionText>
        </VStack>
      ),
    },
    {
      title: 'Eligibility and Registration',
      icon: FaCalendarAlt,
      content: (
        <VStack spacing={4} align="stretch">
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            To join the tournament, you need to maintain a 5-day Quiz streak in
            the Rapid Recap app. It's like building your quiz power!
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Registration is open from Monday to Friday until 11 PM. Don't miss
            your chance to enter the arena of knowledge!
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            During registration, you'll choose 5 categories out of 15 exciting
            options. Plus, everyone gets to tackle the "Current Affairs"
            category!
          </MotionText>
        </VStack>
      ),
    },
    {
      title: 'Tournament Structure',
      icon: FaClipboardList,
      content: (
        <VStack spacing={4} align="stretch">
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            The big event happens every Saturday and Sunday. You can participate
            at any time during these two days!
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            You'll face 5 questions from each of your chosen categories, plus 5
            from Current Affairs. That's a total of 30 brain-teasing questions!
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            The Current Affairs questions come about global events from the last
            5 days, keeping you in the loop!
          </MotionText>
        </VStack>
      ),
    },
    {
      title: 'Quiz Challenge',
      icon: FaClock,
      content: (
        <VStack spacing={4} align="stretch">
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Here's where the adrenaline kicks in: you have just 50 seconds to
            answer 5 questions. It's a true test of speed and knowledge!
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Don't stress if you can't answer them all. The goal is to have fun
            and learn something new with every quiz.
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Remember, practice makes perfect. The more you play, the better
            you'll get at tackling these rapid-fire questions!
          </MotionText>
        </VStack>
      ),
    },
    {
      title: 'Scoring and Leaderboard',
      icon: FaMedal,
      content: (
        <VStack spacing={4} align="stretch">
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            After completing the quiz, you'll see how you stack up against other
            players on our real-time leaderboard.
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your ranking is based on your total RQM (Rapid Quiz Master) score,
            which combines your performance across all categories.
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            The leaderboard updates instantly, so you'll always know where you
            stand in the heat of the competition!
          </MotionText>
        </VStack>
      ),
    },
    {
      title: 'Final Tips and Good Luck!',
      icon: FaGlobe,
      content: (
        <VStack spacing={4} align="stretch">
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Stay curious and keep learning! The tournament is designed to be
            both fun and educational.
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Don't forget to brush up on current affairs. It might give you the
            edge you need to climb the leaderboard!
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Most importantly, enjoy the experience. Whether you're aiming for
            the top spot or just having fun, you're part of an epic quest for
            knowledge!
          </MotionText>
          <MotionText
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            fontWeight="bold"
          >
            Good luck, Rapid Recapper! May your mind be quick and your answers
            true! 🏆🎉
          </MotionText>
        </VStack>
      ),
    },
  ]

  const nextPage = () =>
    setCurrentPage(prev => Math.min(prev + 1, pages.length))
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  const pageVariants = {
    enter: direction => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: direction => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const pageTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      },
    },
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />
      <ModalContent
        as={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        bgGradient={bgGradient}
        color="white"
        borderRadius="3xl"
        overflow="hidden"
        boxShadow="0 0 40px rgba(255, 0, 234, 0.3)"
        p={0}
      >
        <ModalCloseButton
          size="lg"
          color="white"
          top={4}
          right={4}
          zIndex={2}
        />
        <ModalBody p={0}>
          <AnimatePresence custom={direction} mode="wait">
            <MotionFlex
              key={currentPage}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
              p={8}
              direction="column"
              align="center"
            >
              <MotionCircle
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                size={{ base: '85px', md: '100px' }}
                bg="rgba(255, 255, 255, 0.1)"
                border="2px solid"
                borderColor="pink.400"
                mb={6}
              >
                {React.createElement(pages[currentPage - 1].icon, {
                  size: 50,
                  color: theme.colors.pink[400],
                })}
              </MotionCircle>
              <MotionHeading
                as="h2"
                fontSize={{ base: '2xl', md: '4xl' }}
                fontWeight="bold"
                textAlign="center"
                bgGradient="linear(to-r, pink.400, purple.500)"
                bgClip="text"
                mb={2}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {pages[currentPage - 1].title}
              </MotionHeading>
              <Progress
                value={(currentPage / pages.length) * 100}
                size="sm"
                colorScheme="pink"
                width="50%"
                borderRadius="full"
                mb={8}
              />
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                bg="rgba(255, 255, 255, 0.05)"
                p={6}
                borderRadius="xl"
                boxShadow="inner"
                width="100%"
              >
                {pages[currentPage - 1].content}
              </MotionBox>
            </MotionFlex>
          </AnimatePresence>
        </ModalBody>

        <Flex justify="space-between" p={6} bg="rgba(0, 0, 0, 0.3)">
          <Button
            onClick={() => {
              setDirection(-1)
              prevPage()
            }}
            isDisabled={currentPage === 1}
            bg="rgba(255, 255, 255, 0.1)"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
            leftIcon={<FaChevronLeft />}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              setDirection(1)
              nextPage()
            }}
            isDisabled={currentPage === pages.length}
            bg="pink.500"
            color="white"
            _hover={{ bg: 'pink.600' }}
            rightIcon={<FaChevronRight />}
          >
            Next
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  )
}

export default TournamentGuideModal

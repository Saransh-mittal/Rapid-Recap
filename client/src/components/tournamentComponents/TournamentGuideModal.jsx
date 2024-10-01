import React, { useState, useMemo, Suspense, useCallback } from 'react'
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
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Rank1 from '/images/rank_1.webp'

const TrophySVG = React.lazy(() => import('../../assets/svg/TrophySVG'))
const CalenderSVG = React.lazy(() => import('../../assets/svg/CalenderSVG'))
const ClipboardList = React.lazy(() => import('../../assets/svg/ClipboardList'))
const ClockSVG = React.lazy(() => import('../../assets/svg/ClockSVG'))
const Medal = React.lazy(() => import('../../assets/svg/Medal'))
const Globe = React.lazy(() => import('../../assets/svg/Globe'))

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionCircle = motion(Circle)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)

const TournamentGuideModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('TournamentGuideModal')
  const [currentPage, setCurrentPage] = useState(1)
  const [direction, setDirection] = useState(0)
  const theme = useTheme()

  const bgGradient = `linear(to-br, ${theme.colors.gray[900]}, ${theme.colors.purple[900]})`

  const pages = useMemo(
    () => [
      {
        title: t('page1.title'),
        icon: TrophySVG,
        content: (
          <VStack spacing={4} align="stretch">
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('page1.content1')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('page1.content2')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('page1.content3')}
              </MotionText>
            </Flex>
          </VStack>
        ),
      },
      {
        title: t('page2.title'),
        icon: CalenderSVG,
        content: (
          <VStack spacing={4} align="stretch">
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('page2.content1')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('page2.content2')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('page2.content3')}
              </MotionText>
            </Flex>
          </VStack>
        ),
      },
      {
        title: t('page3.title'),
        icon: ClipboardList,
        content: (
          <VStack spacing={4} align="stretch">
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('page3.content1')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('page3.content2')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('page3.content3')}
              </MotionText>
            </Flex>
          </VStack>
        ),
      },
      {
        title: t('page4.title'),
        icon: ClockSVG,
        content: (
          <VStack spacing={4} align="stretch">
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('page4.content1')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('page4.content2')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('page4.content3')}
              </MotionText>
            </Flex>
          </VStack>
        ),
      },
      {
        title: t('page5.title'),
        icon: Medal,
        content: (
          <VStack spacing={4} align="stretch">
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('page5.content1')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('page5.content2')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('page5.content3')}
              </MotionText>
            </Flex>
          </VStack>
        ),
      },
      {
        title: t('page6.title'),
        icon: () => <img src={Rank1} alt="Rank 1" width={50} />,
        content: (
          <VStack spacing={4} align="stretch">
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('page6.content1')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('page6.content2')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('page6.content3')}
              </MotionText>
            </Flex>
          </VStack>
        ),
      },
      {
        title: t('page7.title'),
        icon: Globe,
        content: (
          <VStack spacing={4} align="stretch">
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('page7.content1')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('page7.content2')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('page7.content3')}
              </MotionText>
            </Flex>
            <Flex>
              <Flex mr={2} color={'#FFA500'}>
                ➤
              </Flex>
              <MotionText
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                fontWeight="bold"
              >
                {t('page7.content4')}
              </MotionText>
            </Flex>
          </VStack>
        ),
      },
    ],
    [t],
  )

  const pageVariants = useMemo(
    () => ({
      enter: direction => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      }),
      center: { x: 0, opacity: 1 },
      exit: direction => ({
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      }),
    }),
    [],
  )

  const pageTransition = useMemo(
    () => ({
      type: 'spring',
      stiffness: 300,
      damping: 30,
    }),
    [],
  )

  const iconVariants = useMemo(
    () => ({
      hidden: { scale: 0, rotate: -180 },
      visible: {
        scale: 1,
        rotate: 0,
        transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.1 },
      },
    }),
    [],
  )

  const nextPage = useCallback(
    () => setCurrentPage(prev => Math.min(prev + 1, pages.length)),
    [pages.length],
  )
  const prevPage = useCallback(
    () => setCurrentPage(prev => Math.max(prev - 1, 1)),
    [],
  )

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
              <Suspense fallback={<Circle size="100px" bg="gray.200" />}>
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
              </Suspense>
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
            leftIcon={<ChevronLeftIcon />}
          >
            {t('previous')}
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
            rightIcon={<ChevronRightIcon />}
          >
            {t('next')}
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  )
}

export default TournamentGuideModal

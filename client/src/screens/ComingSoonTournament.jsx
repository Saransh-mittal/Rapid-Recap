import React from 'react'
import {
  Box,
  Container,
  Flex,
  Center,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import CrownSVG from '../assets/svg/CrownSVG'

const EpicQuestGuide = React.lazy(() =>
  import('../components/tournamentComponents/EpicQuestGuide'),
)

const MotionBox = motion(Box)

const ComingSoonTournament = () => {
  const { t } = useTranslation('ComingSoonTournament') // Load the 'tournament' namespace

  return (
    <Box color="white" mt={{ base: 4, md: 8 }} minHeight="100vh">
      <Container maxW="container.xl" py={16} px={0}>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <MotionBox
            flex={1}
            rounded="lg"
            shadow="2xl"
            py={6}
            px={2}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            bg="rgba(0, 0, 0, 0.1)"
            backdropFilter="blur(5px)"
          >
            <Center height="300px">
              <VStack spacing={6}>
                <CrownSVG width="64px" height="64px" />
                <Heading as="h2" size="2xl" color="pink.400" textAlign="center">
                  {t('heading')} {/* Translated Heading */}
                </Heading>
                <Text fontSize="xl" color="gray.300" textAlign="center">
                  {t('subheading')} {/* Translated Subheading */}
                </Text>
                <Text
                  fontSize="sm"
                  color="gray.400"
                  textAlign="center"
                  fontStyle="italic"
                >
                  {t('note')} {/* Translated Note */}
                </Text>
              </VStack>
            </Center>
          </MotionBox>
          <MotionBox
            flex={1}
            rounded="lg"
            shadow="2xl"
            p={6}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            bg="rgba(0, 0, 0, 0.1)"
            backdropFilter="blur(5px)"
            bgGradient="linear(to-br, rgba(26, 32, 44, 0.5), rgba(49, 10, 103, 0.5))"
          >
            <EpicQuestGuide />
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  )
}

export default ComingSoonTournament

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
  Icon,
  Flex,
} from '@chakra-ui/react'
import { FaQuestionCircle, FaLightbulb } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const EpicQuestGuide = () => {
  const { t } = useTranslation('EpicQuestGuide') // Load the 'epicQuestGuide' namespace

  const bgColor = 'rgba(0, 0, 0, 0.3)'
  const borderColor = 'pink.700'
  const questionColor = 'white'
  const answerColor = 'gray.300'
  const iconColor = 'pink.400'

  const guideInstructions = t('questions', { returnObjects: true })

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
              {t('title')} {/* Translated title */}
            </Heading>
            <Text mt={2} fontSize="lg" color="gray.400">
              {t('subtitle')} {/* Translated subtitle */}
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
                        {instruction.question} {/* Translated question */}
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
                      {instruction.answer} {/* Translated answer */}
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

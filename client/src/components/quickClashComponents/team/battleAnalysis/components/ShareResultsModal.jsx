// components/quickClashComponents/team/battleAnalysis/components/ShareResultsModal.jsx
import React, { useState, useRef } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  VStack,
  HStack,
  Heading,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  useBreakpointValue,
  Textarea, // For custom message
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Share2,
  Copy,
  Download,
  Trophy,
  Shield,
  Swords,
  Users,
  Twitter,
  MessageCircle,
  Image as ImageIcon,
  Type, // For text
} from 'lucide-react'
import html2canvas from 'html2canvas'

const MotionBox = motion(Box)

const ShareResultsModal = ({ isOpen, onClose, battle, userTeam }) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [showTrophies, setShowTrophies] = useState(true)
  const [showPersonalScore, setShowPersonalScore] = useState(true)
  const [customMessage, setCustomMessage] = useState('')
  const resultCardRef = useRef(null)

  const modalSize = useBreakpointValue({ base: 'full', sm: 'md', md: 'lg' })
  const previewWidth = useBreakpointValue({
    base: '90vw',
    sm: '400px',
    md: '450px',
  })
  const formLabelFontSize = useBreakpointValue({ base: 'sm', md: 'md' })

  const isUserWinner = battle.winner === userTeam
  const isTie = battle.winner === 'tie'

  const getResultConfig = () => {
    if (isUserWinner) {
      return {
        title: t('VICTORY!'),
        color: 'green',
        icon: Trophy,
        bgGradient: 'linear(to-br, green.600, green.800)',
        borderColor: 'green.400',
      }
    } else if (isTie) {
      return {
        title: t('DRAW!'),
        color: 'yellow',
        icon: Shield,
        bgGradient: 'linear(to-br, yellow.600, yellow.800)',
        borderColor: 'yellow.400',
      }
    } else {
      return {
        title: t('DEFEAT'),
        color: 'red',
        icon: Swords,
        bgGradient: 'linear(to-br, red.600, red.800)',
        borderColor: 'red.400',
      }
    }
  }
  const resultConfig = getResultConfig()

  const getTrophyData = () => {
    if (!battle || !userTeam || !battle.trophyExchange)
      return { trophyChange: 0 }
    const teamMembers =
      userTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers
    const currentUserMember = teamMembers.find(
      member =>
        member.user?._id ===
        JSON.parse(localStorage.getItem('userInfo'))?.user?._id,
    )
    return { trophyChange: currentUserMember?.trophyChange || 0 }
  }
  const { trophyChange } = getTrophyData()

  const getUserScore = () => {
    if (!battle || !userTeam) return 0
    const teamMembers =
      userTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers
    const currentUser = teamMembers.find(
      member =>
        member.user?._id ===
        JSON.parse(localStorage.getItem('userInfo'))?.user?._id,
    )
    return currentUser ? currentUser.score : 0
  }
  const userScore = getUserScore()

  const handleDownloadImage = async () => {
    if (!resultCardRef.current) return
    setIsGeneratingImage(true)
    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#1A202C', // Dark background for canvas
        scale: 2.5, // Higher resolution
        useCORS: true, // If images are external
        logging: true,
      })
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `quickclash-result-${battle._id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: t('Image Downloaded'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        title: t('Image Generation Failed'),
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleCopyText = async () => {
    const teamAName = battle.teamA?.name || t('Team A')
    const teamBName = battle.teamB?.name || t('Team B')
    let shareText = `${resultConfig.title} | ${teamAName} ${battle.teamATotalScore} - ${battle.teamBTotalScore} ${teamBName}.`
    if (customMessage) shareText += `\n"${customMessage}"`
    if (showTrophies && trophyChange !== 0)
      shareText += `\n${t('Trophy Change')}: ${
        trophyChange > 0 ? '+' : ''
      }${trophyChange}`
    if (showPersonalScore && userScore > 0)
      shareText += `\n${t('My Score')}: ${userScore} pts`
    shareText += `\n#QuickClash #RapidRecap`
    try {
      await navigator.clipboard.writeText(shareText)
      toast({
        title: t('Text Copied'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } catch (error) {
      toast({
        title: t('Copy Failed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  const shareOnTwitter = () => {
    const teamAName = battle.teamA?.name || t('Team A')
    const teamBName = battle.teamB?.name || t('Team B')
    let text = `${resultConfig.title} | ${teamAName} ${battle.teamATotalScore} - ${battle.teamBTotalScore} ${teamBName}.`
    if (customMessage) text += ` "${customMessage}"`
    if (showTrophies && trophyChange !== 0)
      text += ` My Trophies: ${trophyChange > 0 ? '+' : ''}${trophyChange}.`
    if (showPersonalScore && userScore > 0)
      text += ` My Score: ${userScore} pts.`
    text += ` Check out Rapid Recap! #QuickClash`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}`
    window.open(twitterUrl, '_blank')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent
        bg="rgba(26, 32, 44, 0.9)" // Slightly transparent
        backdropFilter="blur(15px)"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="purple.600"
        boxShadow="0 10px 40px rgba(0,0,0,0.5)"
      >
        <ModalHeader color="whiteAlpha.900">
          <HStack>
            <Icon as={Share2} color="purple.400" boxSize={5} />
            <Text fontWeight="semibold">{t('Share Battle Results')}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton
          color="whiteAlpha.700"
          _hover={{ bg: 'whiteAlpha.200' }}
        />

        <ModalBody pb={6}>
          <Tabs isFitted variant="soft-rounded" colorScheme="purple">
            <TabList mb={5}>
              <Tab
                fontWeight="medium"
                _selected={{ bg: 'purple.600', color: 'white' }}
              >
                <Icon as={ImageIcon} mr={2} />
                {t('Image')}
              </Tab>
              <Tab
                fontWeight="medium"
                _selected={{ bg: 'purple.600', color: 'white' }}
              >
                <Icon as={Type} mr={2} />
                {t('Text')}
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <VStack spacing={5} align="stretch">
                  <Text color="whiteAlpha.700" fontSize="sm" textAlign="center">
                    {t('Download a shareable image of your results.')}
                  </Text>
                  <Box
                    ref={resultCardRef}
                    bg="gray.800" // Solid color for image generation
                    borderRadius="xl"
                    overflow="hidden"
                    borderWidth="2px"
                    borderColor={resultConfig.borderColor}
                    w={previewWidth}
                    mx="auto"
                    p={5} // Padding inside the card
                    color="white"
                  >
                    <VStack spacing={4}>
                      <Flex
                        bgGradient={resultConfig.bgGradient}
                        py={3}
                        px={4}
                        borderRadius="lg"
                        justify="center"
                        align="center"
                        w="full"
                      >
                        <HStack spacing={2}>
                          <Icon
                            as={resultConfig.icon}
                            color="white"
                            boxSize={5}
                          />
                          <Heading size="md" color="white" fontWeight="bold">
                            {resultConfig.title}
                          </Heading>
                        </HStack>
                      </Flex>

                      <VStack spacing={3} w="full">
                        {[
                          {
                            teamLabel:
                              userTeam === 'teamA'
                                ? t('Your Team')
                                : t('Opponent'),
                            name: battle.teamA?.name || t('Team A'),
                            score: battle.teamATotalScore,
                            colorScheme: 'blue',
                          },
                          {
                            teamLabel:
                              userTeam === 'teamB'
                                ? t('Your Team')
                                : t('Opponent'),
                            name: battle.teamB?.name || t('Team B'),
                            score: battle.teamBTotalScore,
                            colorScheme: 'red',
                          },
                        ].map((teamData, idx) => (
                          <React.Fragment key={idx}>
                            {idx === 1 && (
                              <Text
                                color="whiteAlpha.600"
                                fontWeight="bold"
                                fontSize="sm"
                              >
                                VS
                              </Text>
                            )}
                            <Flex
                              w="full"
                              justify="space-between"
                              align="center"
                              bg="whiteAlpha.50"
                              p={3}
                              borderRadius="md"
                            >
                              <VStack spacing={0.5} align="flex-start">
                                <Badge
                                  colorScheme={teamData.colorScheme}
                                  variant="solid"
                                  fontSize="2xs"
                                  px={1.5}
                                  py={0.5}
                                >
                                  {teamData.teamLabel}
                                </Badge>
                                <Text
                                  fontWeight="semibold"
                                  fontSize="sm"
                                  noOfLines={1}
                                >
                                  {teamData.name}
                                </Text>
                              </VStack>
                              <Text
                                fontSize="2xl"
                                fontWeight="extrabold"
                                color={`${teamData.colorScheme}.300`}
                              >
                                {teamData.score}
                              </Text>
                            </Flex>
                          </React.Fragment>
                        ))}
                      </VStack>

                      {showTrophies && trophyChange !== 0 && (
                        <HStack
                          spacing={2}
                          justify="center"
                          bg={trophyChange > 0 ? 'green.700' : 'red.700'}
                          p={2.5}
                          borderRadius="md"
                          w="full"
                        >
                          <Icon
                            as={Trophy}
                            color={trophyChange > 0 ? 'green.300' : 'red.300'}
                            boxSize={4}
                          />
                          <Text
                            fontWeight="bold"
                            fontSize="sm"
                            color={trophyChange > 0 ? 'green.200' : 'red.200'}
                          >
                            {trophyChange > 0 ? '+' : ''}
                            {trophyChange} {t('Trophies')}
                          </Text>
                        </HStack>
                      )}
                      {showPersonalScore && userScore > 0 && (
                        <HStack
                          spacing={2}
                          justify="center"
                          bg="purple.700"
                          p={2.5}
                          borderRadius="md"
                          w="full"
                        >
                          <Icon as={Users} color="purple.300" boxSize={4} />
                          <Text
                            fontWeight="bold"
                            fontSize="sm"
                            color="purple.200"
                          >
                            {t('Your Score')}: {userScore} {t('pts')}
                          </Text>
                        </HStack>
                      )}
                      <Text
                        fontSize="2xs"
                        color="whiteAlpha.500"
                        position="absolute"
                        bottom={2}
                        right={3}
                      >
                        Rapid Recap by BattleSage AI
                      </Text>
                    </VStack>
                  </Box>

                  <VStack spacing={3} pt={3}>
                    <FormControl
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <FormLabel
                        mb={0}
                        color="whiteAlpha.800"
                        fontSize={formLabelFontSize}
                      >
                        {t('Show Trophy Change')}
                      </FormLabel>
                      <Switch
                        isChecked={showTrophies}
                        onChange={() => setShowTrophies(!showTrophies)}
                        colorScheme="purple"
                      />
                    </FormControl>
                    <FormControl
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <FormLabel
                        mb={0}
                        color="whiteAlpha.800"
                        fontSize={formLabelFontSize}
                      >
                        {t('Show Personal Score')}
                      </FormLabel>
                      <Switch
                        isChecked={showPersonalScore}
                        onChange={() =>
                          setShowPersonalScore(!showPersonalScore)
                        }
                        colorScheme="purple"
                      />
                    </FormControl>
                  </VStack>
                  <Button
                    leftIcon={<Download />}
                    colorScheme="purple"
                    onClick={handleDownloadImage}
                    isLoading={isGeneratingImage}
                    loadingText={t('Generating...')}
                    w="full"
                    size="lg"
                  >
                    {t('Download Image')}
                  </Button>
                </VStack>
              </TabPanel>

              <TabPanel px={0}>
                <VStack spacing={5} align="stretch">
                  <Text color="whiteAlpha.700" fontSize="sm" textAlign="center">
                    {t('Copy a text summary of your results.')}
                  </Text>
                  <FormControl>
                    <FormLabel
                      color="whiteAlpha.800"
                      fontSize={formLabelFontSize}
                    >
                      {t('Add a Custom Message (optional)')}
                    </FormLabel>
                    <Textarea
                      value={customMessage}
                      onChange={e => setCustomMessage(e.target.value)}
                      placeholder={t('E.g., What a match!')}
                      color="white"
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.300"
                      _placeholder={{ color: 'whiteAlpha.500' }}
                      focusBorderColor="purple.400"
                      rows={2}
                    />
                  </FormControl>

                  <Box
                    bg="whiteAlpha.50"
                    p={4}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="whiteAlpha.200"
                  >
                    <Heading
                      size="xs"
                      color="whiteAlpha.600"
                      mb={2}
                      textTransform="uppercase"
                    >
                      {t('Preview')}
                    </Heading>
                    <Text
                      color="whiteAlpha.900"
                      fontSize="sm"
                      whiteSpace="pre-wrap"
                    >
                      {`${resultConfig.title} | ${
                        battle.teamA?.name || t('Team A')
                      } ${battle.teamATotalScore} - ${battle.teamBTotalScore} ${
                        battle.teamB?.name || t('Team B')
                      }.`}
                      {customMessage && `\n"${customMessage}"`}
                      {showTrophies &&
                        trophyChange !== 0 &&
                        `\n${t('Trophy Change')}: ${
                          trophyChange > 0 ? '+' : ''
                        }${trophyChange}`}
                      {showPersonalScore &&
                        userScore > 0 &&
                        `\n${t('My Score')}: ${userScore} pts`}
                      {`\n#QuickClash #RapidRecap`}
                    </Text>
                  </Box>

                  <VStack spacing={3} pt={2}>
                    <FormControl
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <FormLabel
                        mb={0}
                        color="whiteAlpha.800"
                        fontSize={formLabelFontSize}
                      >
                        {t('Include Trophy Change')}
                      </FormLabel>
                      <Switch
                        isChecked={showTrophies}
                        onChange={() => setShowTrophies(!showTrophies)}
                        colorScheme="purple"
                      />
                    </FormControl>
                    <FormControl
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <FormLabel
                        mb={0}
                        color="whiteAlpha.800"
                        fontSize={formLabelFontSize}
                      >
                        {t('Include Personal Score')}
                      </FormLabel>
                      <Switch
                        isChecked={showPersonalScore}
                        onChange={() =>
                          setShowPersonalScore(!showPersonalScore)
                        }
                        colorScheme="purple"
                      />
                    </FormControl>
                  </VStack>

                  <Button
                    leftIcon={<Copy />}
                    colorScheme="purple"
                    onClick={handleCopyText}
                    w="full"
                    size="lg"
                  >
                    {t('Copy to Clipboard')}
                  </Button>

                  <HStack spacing={4} pt={2}>
                    <Button
                      leftIcon={<Twitter />}
                      colorScheme="twitter"
                      size="sm"
                      onClick={shareOnTwitter}
                      flex={1}
                    >
                      Twitter
                    </Button>
                    <Button
                      leftIcon={<MessageCircle />}
                      colorScheme="whatsapp"
                      size="sm"
                      isDisabled
                      flex={1}
                    >
                      WhatsApp
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="whiteAlpha.200">
          <Button
            variant="ghost"
            colorScheme="purple"
            mr={3}
            onClick={onClose}
            fontWeight="medium"
          >
            {t('Close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ShareResultsModal

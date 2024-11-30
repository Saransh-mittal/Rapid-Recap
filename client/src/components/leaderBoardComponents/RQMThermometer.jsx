import React, { useMemo } from 'react'
import {
  Box,
  Flex,
  HStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
  VStack,
  Divider,
  Portal,
} from '@chakra-ui/react'
import ThermometerSVG from '../../assets/svg/ThermometerSVG'

// RQM ranges and their descriptions
const RQM_RANGES = {
  HIGH: {
    min: 60,
    color: {
      primary: '#22c55e',
      secondary: '#86efac',
      glow: '#22c55e40',
    },
    title: 'News Grandmaster',
    description:
      'His/Her Rapid Quiz Mastery exemplifies exceptional news comprehension! Shows remarkable ability to analyze and recall information under time pressure.',
    brainLevel: 'Rapid Neural Network',
    trait: 'Lightning-fast news analysis with pristine accuracy',
  },
  GOOD: {
    min: 40,
    color: {
      primary: '#3b82f6',
      secondary: '#93c5fd',
      glow: '#3b82f640',
    },
    title: 'Swift Analyst',
    description:
      'He/She demonstrates excellent news retention skills! Consistently performs well in rapid-fire current affairs challenges.',
    brainLevel: 'Information Accelerator',
    trait: 'Quick comprehension with strong retention abilities',
  },
  MODERATE: {
    min: 20,
    color: {
      primary: '#f59e0b',
      secondary: '#fcd34d',
      glow: '#f59e0b40',
    },
    title: 'Knowledge Seeker',
    description:
      'His/Her Rapid Quiz Mastery shows promising development! Each 50-second challenge strengthens information processing speed.',
    brainLevel: 'Learning Amplifier',
    trait: 'Growing mastery over quick news comprehension',
  },
  LOW: {
    min: 0,
    color: {
      primary: '#ef4444',
      secondary: '#fca5a5',
      glow: '#ef444440',
    },
    title: 'News Explorer',
    description:
      'His/Her journey in Rapid Quiz Mastery is launching! Every quick quiz brings them closer to news analysis mastery.',
    brainLevel: 'Knowledge Accelerator',
    trait: 'Developing quick information processing abilities',
  },
}

// Get RQM range info based on score
const getRQMInfo = rqm => {
  const ranges = Object.values(RQM_RANGES).sort((a, b) => b.min - a.min)
  return ranges.find(range => rqm >= range.min)
}

const RQMThermometer = React.memo(
  ({
    rqm = 0,
    fontSize = { base: '2xs', md: 'xs', lg: 'sm' },
    rqmFontSize = { base: 'xs', md: 'sm', lg: 'md' },
    fromProfile = false,
  }) => {
    const fillPercentage = useMemo(
      () => Math.min(Math.max((rqm / 80) * 100, 0), 100),
      [rqm],
    )
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [toggle, setToggle] = React.useState(false)
    const rqmInfo = useMemo(() => getRQMInfo(rqm), [rqm])
    const uniqueId = useMemo(() => Math.random().toString(36).substring(7), [])

    const handleClick = e => {
      if (!isOpen && !toggle) {
        onOpen()
        setToggle(true)
      } else {
        onClose()
        setToggle(false)
      }
      e.stopPropagation()
    }

    const CommonPopoverContent = () => (
      <PopoverContent
        w="280px"
        bg="gray.800"
        transform="translate(-20px, 0px) !important"
        borderColor="gray.700"
        borderWidth="1px"
        boxShadow={`0 0 20px ${rqmInfo.color.glow}`}
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          h="2px"
          bgGradient={`linear(to-r, ${rqmInfo.color.glow}, ${rqmInfo.color.primary}, ${rqmInfo.color.glow})`}
        />
        <PopoverArrow bg="gray.800" />

        <PopoverBody p={4}>
          <VStack align="stretch" spacing={3}>
            <Flex justify="space-between" align="center">
              <Text
                color={rqmInfo.color.primary}
                fontWeight="bold"
                fontSize="lg"
              >
                {rqmInfo.title}
              </Text>
              <Text
                color={rqmInfo.color.secondary}
                fontSize="sm"
                fontWeight="semibold"
              >
                Average RQM: {rqm}
              </Text>
            </Flex>

            <Box py={2}>
              <Text
                color={rqmInfo.color.secondary}
                fontSize="sm"
                fontWeight="semibold"
                mb={1}
              >
                Brain Sharpness Level:
              </Text>
              <Text
                color="white"
                fontSize="md"
                fontWeight="bold"
                bgGradient={`linear(to-r, ${rqmInfo.color.primary}, ${rqmInfo.color.secondary})`}
                bgClip="text"
              >
                {rqmInfo.brainLevel}
              </Text>
            </Box>

            <Divider borderColor="gray.600" />

            <Box>
              <Text color="gray.300" fontSize="sm" lineHeight="tall">
                {rqmInfo.description}
              </Text>
            </Box>

            <Box bg="gray.700" p={2} borderRadius="md">
              <Text
                color={rqmInfo.color.secondary}
                fontSize="xs"
                fontWeight="medium"
              >
                SIGNATURE TRAIT
              </Text>
              <Text color="white" fontSize="sm" mt={1}>
                {rqmInfo.trait}
              </Text>
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    )

    return (
      <Popover isOpen={isOpen} onClose={onClose} closeOnBlur={true}>
        <PopoverTrigger>
          <HStack
            spacing={1}
            align="center"
            justifyContent={'center'}
            w={{ base: 'full', md: 'fit-content' }}
            cursor="pointer"
            onClick={handleClick}
            _hover={{ opacity: 0.9 }}
          >
            <Box position="relative" w="fit-content">
              <ThermometerSVG
                rqm={rqm}
                colors={rqmInfo.color}
                uniqueId={uniqueId}
                fillPercentage={fillPercentage}
              />
              <Box
                position="absolute"
                bottom="0"
                left="50%"
                w={{ base: '1.5', md: '3' }}
                h="0.5"
                borderRadius="full"
                transform="translateX(-50%)"
                bg={rqmInfo.color.glow}
                sx={{
                  boxShadow: `0 0 8px 1px ${rqmInfo.color.glow}`,
                }}
              />
            </Box>

            <Flex direction="column" align={{ base: 'start', md: 'center' }}>
              <Text
                fontSize={rqmFontSize}
                fontWeight="bold"
                color={rqmInfo.color.primary}
                lineHeight="shorter"
              >
                {rqm}
              </Text>
              <Text
                fontSize={fontSize}
                color={rqmInfo.color.secondary}
                lineHeight="shorter"
                mt="-1px"
              >
                RQM
              </Text>
            </Flex>
          </HStack>
        </PopoverTrigger>
        {fromProfile ? (
          <Portal>
            <CommonPopoverContent />
          </Portal>
        ) : (
          <CommonPopoverContent />
        )}
      </Popover>
    )
  },
)

RQMThermometer.displayName = 'RQMThermometer'

export default RQMThermometer

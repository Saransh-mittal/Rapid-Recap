import React from 'react'
import {
  Box,
  Text,
  Image,
  Flex,
  VStack,
  useBreakpointValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useDisclosure,
} from '@chakra-ui/react'
import { badgeConfig } from '../../models/badgeConfig'
import { keyframes } from '@emotion/react'
import { useTranslation } from 'react-i18next'
import { getTournamentCategories } from '../../assets/TournamentCategories'

const fadeInScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`

const TournamentBadge = ({
  tournamentNumber,
  rank,
  name,
  inGameName,
  participantCnt,
  size = 'md',
  badgeName = null,
  onPopoverToggle,
  isBadgeGallery = false,
}) => {
  const { t } = useTranslation('TournamentBadge')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    image,
    style,
    icon: RankIcon,
    sizeValues,
  } = badgeConfig[badgeName?.name] || {}

  const sizeValue = sizeValues ? sizeValues[size] || sizeValues.md : null
  const { width, height, fontSize, textPosition, mr } = sizeValue || {}

  const iconSize = useBreakpointValue({ base: '32px', sm: '24px' })

  const handleClick = e => {
    e.stopPropagation()
    if (!isBadgeGallery) {
      if (isOpen) {
        onClose()
      } else {
        onOpen()
      }
      if (onPopoverToggle) {
        onPopoverToggle(!isOpen)
      }
    }
  }

  // Check if badgeName?.text matches any category key and assign the translated value
  const categories = getTournamentCategories()
  const matchedCategory = categories.find(
    cat => cat.key === badgeName?.text.toLowerCase(),
  )
  const translatedBadgeName = matchedCategory
    ? matchedCategory.label
    : badgeName?.text

  if (!tournamentNumber || !badgeName?.name) return null

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      closeOnBlur={true}
      autoFocus={false}
    >
      <PopoverTrigger>
        <Box
          position="relative"
          width={width}
          height={height}
          borderRadius="50%"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          transition="all 0.3s ease"
          _hover={{
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
            transform: 'scale(1.05)',
          }}
          mr={mr ? mr : 0}
          onClick={handleClick}
        >
          <Image
            src={image}
            alt={`Rank ${rank} Badge`}
            width="100%"
            height="100%"
            objectFit="contain"
          />
          <Flex
            flexDirection="column"
            position="absolute"
            bottom={textPosition.bottom}
            left="50%"
            transform={`translateX(${textPosition.x}%) translateY(${textPosition.y}%)`}
            color="white"
            fontSize={fontSize}
            fontWeight="bold"
            textShadow="1px 1px 2px rgba(0,0,0,0.6)"
            textTransform="capitalize"
          >
            <Flex>{translatedBadgeName}</Flex>
            <Flex justifyContent="center" mt={-1}>
              {'#' + tournamentNumber?.toString().padStart(3, '0')}
            </Flex>
          </Flex>
        </Box>
      </PopoverTrigger>

      <PopoverContent
        sx={{
          ...style,
          animation: `${fadeInScale} 0.3s ease-out forwards`,
        }}
        _focus={{ boxShadow: 'none' }}
      >
        <PopoverBody p={4}>
          <VStack spacing={2} align="center">
            <Flex
              alignItems="center"
              justifyContent="center"
              mb={0}
              flexWrap="wrap"
            >
              <Box
                bg="rgba(255, 255, 255, 0.2)"
                borderRadius="50%"
                p={1}
                mr={2}
                mb={{ base: 2, md: 0 }}
              >
                {RankIcon && (
                  <RankIcon
                    size={iconSize}
                    style={{
                      filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))',
                    }}
                    color={style?.color}
                  />
                )}
              </Box>
              <Flex
                flexDirection="column"
                alignItems={{ base: 'center', md: 'flex-start' }}
              >
                <Text
                  fontWeight="bold"
                  fontSize={{ base: 'lg', md: 'xl' }}
                  mb={0}
                >
                  {name}
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} opacity={0.8}>
                  @{inGameName}
                </Text>
              </Flex>
            </Flex>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="semibold"
              textAlign="center"
            >
              {t('rank')} {rank} {t('inTournament')} #
              {String(tournamentNumber)?.padStart(3, '0')}
            </Text>
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              opacity={0.9}
              textAlign="center"
            >
              {t('outOf')} {participantCnt} {t('participants')}
            </Text>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default TournamentBadge

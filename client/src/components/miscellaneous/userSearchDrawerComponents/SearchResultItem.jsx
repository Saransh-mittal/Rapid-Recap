import React from 'react'
import { Flex, Avatar, Text, Badge, Box, Button } from '@chakra-ui/react'
import { FiZap } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import TournamentBadges from '../../tournamentComponents/TournamentBadges'

const SearchResultItem = React.memo(
  ({
    user,
    onItemClick,
    hoverBg,
    textColor,
    subTextColor,
    badgeBg,
    TournamentBadgeTranslate,
    onChallengeClick,
  }) => {
    const nameRef = React.useRef(null)
    const [badgeOffset, setBadgeOffset] = React.useState(0)
    const { t } = useTranslation('QuickClash')

    React.useEffect(() => {
      if (nameRef.current) {
        const nameWidth = nameRef.current.offsetWidth
        setBadgeOffset(Math.min(nameWidth * 0.1, 10)) // 10% of name width, max 10px
      }
    }, [user.name])

    const handleChallenge = e => {
      e.stopPropagation()
      onChallengeClick(user)
    }

    return (
      <Flex
        alignItems="center"
        py={5}
        px={3}
        borderRadius="lg"
        transition="all 0.3s"
        cursor="pointer"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgImage: hoverBg,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 20px rgba(138, 43, 226, 0.2)',
          _before: {
            opacity: 1,
          },
        }}
        onClick={() => onItemClick(user.inGameName)}
      >
        <Flex alignItems="center">
          <Avatar name={user.name} src={user.pic} size="md" zIndex={1} />
        </Flex>
        <Box ml={4} flex={1} zIndex={1}>
          <Text
            ref={nameRef}
            fontSize="sm"
            fontWeight="semibold"
            color={textColor}
            mb="2px"
            display="inline-block"
          >
            {user.name}
          </Text>
          <Text fontSize="xs" color={subTextColor} mb={0}>
            @{user.inGameName}
          </Text>
        </Box>
        {user?.displayedBadge && (
          <Box
            ml={`-${4 + badgeOffset}px`}
            mt={0}
            zIndex={2}
            transition="margin-left 0.3s ease"
          >
            <TournamentBadges
              tournamentNumber={user?.displayedBadge?.tournamentNumber}
              rank={user?.displayedBadge?.rank}
              name={user?.name}
              inGameName={user?.inGameName}
              participantCnt={user?.displayedBadge?.participantCnt}
              size="sm"
              badgeName={{
                name: user?.displayedBadge?.badgeName,
                text: user?.displayedBadge?.text,
              }}
              t={TournamentBadgeTranslate}
            />
          </Box>
        )}
        <Flex flexDir="column" alignItems="center" gap={2} mx={2} zIndex={1}>
          <Badge
            bg={badgeBg}
            color="white"
            borderRadius="full"
            px={2}
            py={1}
            fontWeight="bold"
            fontSize="xs"
            boxShadow="0 2px 4px rgba(0,0,0,0.2)"
            display="flex"
            alignItems="center"
            w={'4.6rem'}
            justifyContent="center"
          >
            <Text as="span" role="img" aria-label="brain" mr={1}>
              🧠
            </Text>
            {user.IQ_score}
          </Badge>

          <Button
            size="xs"
            colorScheme="purple"
            leftIcon={<FiZap />}
            onClick={handleChallenge}
            bgGradient="linear(to-r, purple.500, purple.700)"
            _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
            boxShadow="0 2px 4px rgba(0,0,0,0.2)"
            zIndex={2}
          >
            {t('Challenge')}
          </Button>
        </Flex>
      </Flex>
    )
  },
)

export default SearchResultItem

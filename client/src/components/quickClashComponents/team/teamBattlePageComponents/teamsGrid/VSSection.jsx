// components/quickClashComponents/team/teamBattlePageComponents/teamsGrid/VSSection.jsx
import React, { memo } from 'react'
import {
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Swords } from 'lucide-react'

/**
 * VS Section Component (Animations Removed)
 */
const VSSection = memo(
  ({ leftTeam, rightTeam, vsSectionEffectiveWidth, vsSpacing }) => {
    const { t } = useTranslation('QuickClash')

    return (
      <Flex
        align="center"
        justifyContent="center"
        direction="column"
        px={vsSpacing}
        width={vsSectionEffectiveWidth}
        flex="0 0 auto"
        my={{ base: 'auto', md: 0 }}
        py={2}
      >
        <VStack spacing={{ base: 1.5, md: 2.5 }}>
          <Text
            fontFamily="'Orbitron', sans-serif"
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
            fontWeight="bold"
            bgGradient="linear(to-r, cyan.400, purple.500, cyan.400)"
            bgClip="text"
            letterSpacing="1.5px"
            lineHeight="1"
          >
            VS
          </Text>

          <Icon
            as={Swords}
            boxSize={{ base: 4, md: 6, lg: 8 }}
            color="purple.300"
          />

          <HStack spacing={{ base: 1, md: 1.5 }} mt={{ base: 0.5, md: 1 }}>
            <Badge
              bgGradient="linear(to-br, blue.700, blue.500)"
              color="white"
              border="1px solid"
              borderColor="blue.300"
              boxShadow="0 0 8px rgba(0, 123, 255, 0.3), inset 0 0 4px rgba(0, 123, 255, 0.2)"
              px={{ base: 1.5, md: 2 }}
              py={{ base: 0.5, md: 1 }}
              borderRadius="md"
              fontSize={{ base: 'sm', md: 'md' }}
              fontFamily="'Aldrich', sans-serif"
              fontWeight="bold"
              minW="30px"
              textAlign="center"
            >
              {leftTeam.wins}
            </Badge>
            <Text
              color="whiteAlpha.700"
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="bold"
              fontFamily="'Orbitron', sans-serif"
            >
              :
            </Text>
            <Badge
              bgGradient="linear(to-br, red.700, red.500)"
              color="white"
              border="1px solid"
              borderColor="red.300"
              boxShadow="0 0 8px rgba(255, 0, 0, 0.3), inset 0 0 4px rgba(255, 0, 0, 0.2)"
              px={{ base: 1.5, md: 2 }}
              py={{ base: 0.5, md: 1 }}
              borderRadius="md"
              fontSize={{ base: 'sm', md: 'md' }}
              fontFamily="'Aldrich', sans-serif"
              fontWeight="bold"
              minW="30px"
              textAlign="center"
            >
              {rightTeam.wins}
            </Badge>
          </HStack>
        </VStack>
      </Flex>
    )
  },
)

VSSection.displayName = 'VSSection'

export default VSSection

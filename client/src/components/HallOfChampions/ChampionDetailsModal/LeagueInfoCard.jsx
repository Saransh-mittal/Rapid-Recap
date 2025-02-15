import React from 'react'
import { Box, Text, VStack, HStack, Grid } from '@chakra-ui/react'
import { Users, CircleDot } from 'lucide-react'
import { fadeIn } from './animations'

const LeagueInfoCard = ({ champion, t }) => (
  <Box
    w="full"
    p={6}
    bg="rgba(255, 255, 255, 0.03)"
    borderRadius="xl"
    backdropFilter="blur(10px)"
    border="1px solid"
    borderColor="whiteAlpha.100"
    style={{
      animation: `${fadeIn} 0.6s ease-out 0.5s forwards`,
    }}
  >
    <VStack spacing={4}>
      <HStack w="full" justify="space-between">
        <Text color="white" fontSize="lg" fontWeight="semibold">
          {t('League')}
        </Text>
        <Text color="whiteAlpha.600" fontSize="sm">
          {champion.month}/{champion.year}
        </Text>
      </HStack>
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
        gap={4}
        w="full"
      >
        {[
          { icon: Users, label: 'Society', value: champion.society },
          { icon: CircleDot, label: 'Circle', value: champion.circle },
        ].map(
          (item, index) =>
            item.value && (
              <Box
                key={index}
                p={4}
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="xl"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-2px)',
                  bg: 'rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}
                style={{
                  animation: `${fadeIn} 0.6s ease-out ${
                    0.6 + index * 0.1
                  }s forwards`,
                }}
              >
                <VStack align="start" spacing={1}>
                  <HStack>
                    <item.icon size={16} color="white" />
                    <Text color="whiteAlpha.700" fontSize="sm">
                      {item.label}
                    </Text>
                  </HStack>
                  <Text color="white" fontSize="lg" fontWeight="semibold">
                    {item.value}
                  </Text>
                </VStack>
              </Box>
            ),
        )}
      </Grid>
    </VStack>
  </Box>
)
export default LeagueInfoCard

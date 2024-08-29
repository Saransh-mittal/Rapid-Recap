import React from 'react'
import { Flex, Text, Image, Badge, Box } from '@chakra-ui/react'
import QuinBoost from '../quizComponents/QuinBoost'
import Button from '../../miscellaneous/ButtonComponent'
import starBoost from '/GIFs/starBoost.gif'
import { useTranslation } from 'react-i18next'

const BoostSection = React.memo(
  ({
    isQuinBoostAvailable,
    quizLeftToGetQuizBoost,
    openModal,
    playClick,
    notLoggedIn,
    toast,
    isBoosted,
  }) => {
    const { t } = useTranslation('BoostSection')
    const handleBoostClick = () => {
      playClick()
      if (notLoggedIn) {
        toast({
          title: t('loginRequiredTitle'),
          description: t('loginRequiredDescription'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      openModal()
    }

    return (
      <Flex mb={4} flexDirection="column">
        {isQuinBoostAvailable ? (
          <QuinBoost isBoosted={isBoosted} />
        ) : (
          !isBoosted && (
            <Flex flexDirection={'column'}>
              <Text
                m={0}
                p={0}
                textAlign={'left'}
                fontSize={'0.8rem'}
                fontWeight={'bold'}
              >
                {t('quinBoostLabel')}
              </Text>
              <Flex position="relative">
                <Button
                  buttonW="7rem"
                  textColor={'white'}
                  onClick={handleBoostClick}
                >
                  {quizLeftToGetQuizBoost} {t('quizLeftMessage')}
                </Button>
              </Flex>
            </Flex>
          )
        )}
        {isBoosted && (
          <Flex
            alignItems="center"
            gap={1}
            cursor="pointer"
            wordBreak={'break-word'}
            ml={'-0.9rem'}
            flexDirection="column"
          >
            <Flex alignItems="center">
              <Image
                src={starBoost}
                bg="none"
                h={['40px', '50px', '60px']}
                w={['40px', '50px', '60px']}
              />
              <Badge
                fontSize={['sm', 'md', 'lg']}
                color="yellow"
                bg="none"
                wordBreak={'break-word'}
              >
                {t('enjoyMultiplier')}
              </Badge>
            </Flex>

            <Box
              mt={-5}
              px={2}
              py={1}
              borderRadius="full"
              bg="rgba(145, 127, 179, 0.3)"
              color="white"
              fontSize="xs"
              fontWeight="bold"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
            >
              {quizLeftToGetQuizBoost} Quiz Left For Quin Boost
            </Box>
          </Flex>
        )}
      </Flex>
    )
  },
)

export default BoostSection

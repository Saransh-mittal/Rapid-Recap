import React from 'react'
import { Flex, Text, Image, Badge } from '@chakra-ui/react'
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
      <Flex mb={4}>
        {isQuinBoostAvailable ? (
          <QuinBoost />
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
            gap={2}
            cursor="pointer"
            onClick={openModal}
          >
            <Image
              src={starBoost}
              bg="none"
              h={['40px', '50px', '60px']}
              w={['40px', '50px', '60px']}
            />
            <Badge fontSize={['sm', 'md', 'lg']} color="yellow" bg="none">
              {t('enjoyMultiplier')}
            </Badge>
          </Flex>
        )}
      </Flex>
    )
  },
)

export default BoostSection

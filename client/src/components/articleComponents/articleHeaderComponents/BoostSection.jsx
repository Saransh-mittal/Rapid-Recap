import React from 'react'
import { Flex, Text, Image, Badge } from '@chakra-ui/react'
import QuinBoost from '../quizComponents/QuinBoost'
import Button from '../../miscellaneous/ButtonComponent'
import starBoost from '/GIFs/starBoost.gif'

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
    const handleBoostClick = () => {
      playClick()
      if (notLoggedIn) {
        toast({
          title: 'Login Required',
          description: 'Please log in to share this article.',
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
                Quin Boost
              </Text>
              <Flex position="relative">
                <Button
                  buttonW="7rem"
                  textColor={'white'}
                  onClick={handleBoostClick}
                >
                  {quizLeftToGetQuizBoost} Quiz Left
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
            onClick={openModal}
            wordBreak={'break-word'}
            ml={'-0.9rem'}
          >
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
              Enjoy!! 1.5x multiplier
            </Badge>
          </Flex>
        )}
      </Flex>
    )
  },
)

export default BoostSection

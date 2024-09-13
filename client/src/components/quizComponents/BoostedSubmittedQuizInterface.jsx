import React from 'react'
import { Text, SlideFade, Heading, Image, Flex } from '@chakra-ui/react'
import rocket from '/images/rocket.webp'
import Button from '../miscellaneous/ButtonComponent'
import ButtonGradient from '../../assets/svg/ButtonGradient'
import { useTranslation } from 'react-i18next'

const BoostedSubmittedQuizInterface = ({
  score,
  isOpen,
  submitLoad,
  onViewReport,
  isBoosted,
  isQuinBoostAvailable,
}) => {
  // Added onViewReport prop
  const { t } = useTranslation('BoostedSubmittedQuizInterface')
  const rocketStyle = {
    position: 'relative',
    bottom: '-500%',
    animation: 'animate-rocket 2s ease forwards, animate 0.2s ease infinite',
  }
  const scoreStyle = {
    position: 'relative',
    bottom: '-500%',
    animation: 'animate-rocket 2s ease forwards',
  }

  return (
    <SlideFade
      direction="bottom"
      in={isOpen}
      offsetY="20px"
      style={{ zIndex: 10 }}
    >
      <Flex
        position={'relative'}
        flexDirection={'column'}
        w={'100%'}
        height={'100%'}
        justifyContent={'center'}
        alignItems={'center'}
        color={'white'}
        css={`
          @property --angle {
            syntax: '<angle>';
            initial-value: 90deg;
            inherits: true;
          }

          @property --gradX {
            syntax: '<percentage>';
            initial-value: 50%;
            inherits: true;
          }

          @property --gradY {
            syntax: '<percentage>';
            initial-value: 0%;
            inherits: true;
          }

          --d: 2500ms;
          --angle: 90deg;
          --gradX: 100%;
          --gradY: 50%;
          --c1: rgba(168, 239, 255, 1);
          --c2: rgba(168, 239, 255, 0.1);

          @keyframes animate-rocket {
            0% {
              bottom: -500%;
            }
            100% {
              bottom: 5%;
            }
          }
          @keyframes borderRotate {
            100% {
              --angle: 420deg;
            }
          }
          @keyframes animate {
            0%,
            100% {
              transform: translateY(-2px);
            }
            50% {
              transform: translateY(2px);
            }
          }
        `}
      >
        <Heading
          as="h3"
          size="lg"
          width="100%"
          textAlign="center"
          marginBottom="1rem"
        >
          {t('quizCompletedMessage')}
        </Heading>

        <Flex flexDirection={'row-reverse'}>
          <Flex
            justifyContent={'center'}
            alignItems={'center'}
            w={'100%'}
            height={'120px'}
            backgroundColor={'transparent'}
            marginTop="20"
          >
            <Flex flexDirection={'column'} style={scoreStyle}>
              <Heading
                as={'h4'}
                fontSize="4xl"
                textAlign="center"
                fontFamily={`"Honk", system-ui`}
                p={0}
              >
                {t('rapidQuizMasteryScore')}
              </Heading>
              <Flex w={'100%'}>
                <Flex
                  w={'100%'}
                  justifyContent={'center'}
                  flexDirection={'column'}
                  fontSize="3vw"
                  margin="max(1rem, 3vw)"
                  border="0.35rem solid"
                  paddingX="2vw"
                  paddingTop={'1vw'}
                  borderRadius="1rem"
                  style={{
                    borderImage:
                      'conic-gradient(from var(--angle), var(--c2), var(--c1) 0.1turn, var(--c1) 0.15turn, var(--c2) 0.25turn) 30',
                  }}
                  animation="borderRotate var(--d) linear infinite forwards"
                >
                  {submitLoad ? (
                    <Heading>{t('calculating')}</Heading>
                  ) : (
                    <Heading>{score}</Heading>
                  )}
                  <Text
                    fontSize={'1rem'}
                    color={'yellow'}
                    backgroundColor="rgba(255,255,255,0.1)"
                    textShadow="1px 1px 2px rgba(0, 0, 0, 0.4)"
                    padding={'2px'}
                    marginTop={'auto'}
                    marginBottom={'0.5rem'}
                  >
                    {score !== 0
                      ? isBoosted && isQuinBoostAvailable
                        ? `1.75x ${t(`boostedText`)}`
                        : `1.5x ${t(`boostedText`)}`
                      : `"Don't give up! Keep going!"`}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          <Flex
            justifyContent={'center'}
            alignItems={'center'}
            width={'120px'}
            height={'120px'}
            borderRadius={'50%'}
            backgroundColor={'transparent'}
          >
            <Flex
              style={rocketStyle}
              _before={{
                content: `""`,
                position: 'absolute',
                left: '50%',
                bottom: '-100px',
                transform: 'translateX(-50%)',
                width: '10px',
                height: '100px',
                background: 'linear-gradient(#00d0ff,transparent)',
              }}
              _after={{
                content: `""`,
                position: 'absolute',
                left: '50%',
                bottom: '-100px',
                transform: 'translateX(-50%)',
                width: '10px',
                height: '100px',
                background: 'linear-gradient(#00d0ff,transparent)',
                filter: 'blur(20px)',
              }}
            >
              <Image src={rocket} h={'50px'} w={'35px'} background={'none'} />
            </Flex>
          </Flex>
        </Flex>
        {score === 0 ? (
          <Text
            w={'75%'}
            textAlign={'left'}
            color={'#FFFFFF'}
            p={0}
            m={0}
            fontWeight={'bold'}
            fontStyle={'italic'}
            fontSize={'1rem'}
            borderLeft={'5px solid #CCCCCC'}
            paddingLeft={'10px'}
            marginTop={'4rem'}
          >
            {t('noWorryMessage')}
          </Text>
        ) : (
          <Text
            w={'75%'}
            textAlign={'left'}
            color={'#FFFFFF'}
            p={0}
            m={0}
            fontWeight={'bold'}
            fontStyle={'italic'}
            fontSize={'1rem'}
            borderLeft={'5px solid #CCCCCC'}
            paddingLeft={'10px'}
            marginTop={'4rem'}
          >
            {t('congratulationMessage')}
          </Text>
        )}
        <Flex mt={4}>
          <ButtonGradient />
          <Button colorScheme="blue" onClick={onViewReport}>
            {t('viewReport')}
          </Button>
        </Flex>
      </Flex>
    </SlideFade>
  )
}

export default BoostedSubmittedQuizInterface

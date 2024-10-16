import React, { useEffect, useState, useCallback, Suspense } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Skeleton,
  useMediaQuery,
} from '@chakra-ui/react'
import Heading from '../../../miscellaneous/HeadingComponent'
import { useTranslation } from 'react-i18next'

// Lazy load child components
const LineGraph = React.lazy(() =>
  import('../../RightProfileSectionComponents/LineGraph'),
)
const IQBarGraph = React.lazy(() =>
  import('../../RightProfileSectionComponents/IQBarGraph'),
)
const SolvedQuizzes = React.lazy(() =>
  import('../../RightProfileSectionComponents/SolvedQuizzes'),
)
const RankAndSociety = React.lazy(() =>
  import('../../RightProfileSectionComponents/RankAndSociety'),
)

const SeasonModal = ({
  notInTheSeason,
  isOpen,
  onClose,
  season,
  isLoading,
  profile,
  privacyProfileData,
  loginedUserProfile,
  inGameName,
}) => {
  const [isLargerThan992px] = useMediaQuery('(min-width: 992px)')
  const [initialTouchY, setInitialTouchY] = useState(null)
  const { t: IQBartranslate } = useTranslation('IQBarGraph')
  const { t: IQLineTranslate } = useTranslation('LineGraph')
  const { t: SeasonModalTranslate } = useTranslation('SeasonModal')

  // Memoize scrollbar style creation function
  const styleScrollbar = useCallback(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .seasonModalBody::-webkit-scrollbar {
        width: 8px;
      }
      .seasonModalBody::-webkit-scrollbar-thumb {
        background-color: #333;
        border-radius: 4px;
      }
      .seasonModalBody::-webkit-scrollbar-thumb:hover {
        background-color: #555;
      }
      .seasonModalBody::-webkit-scrollbar-track {
        background-color: #0f0d15;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  useEffect(() => {
    const handleWheel = event => {
      const modalBody = document.querySelector('.seasonModalBody')
      if (modalBody) {
        modalBody.scrollTop += event.deltaY
      }
    }

    const handleTouchStart = event => {
      if (event.touches.length === 1) {
        setInitialTouchY(event.touches[0].clientY)
      }
    }

    const handleTouchMove = event => {
      if (event.touches.length === 1) {
        const modalBody = document.querySelector('.seasonModalBody')
        if (modalBody && initialTouchY !== null) {
          const currentTouchY = event.touches[0].clientY
          modalBody.scrollTop += initialTouchY - currentTouchY
          setInitialTouchY(currentTouchY)
        }
      }
    }

    if (isOpen) {
      const cleanUpStyles = styleScrollbar()

      // MutationObserver setup is memoized
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length > 0) {
            const modalContainer = document.querySelector(
              '.chakra-modal__content-container.css-1ocl83d',
            )

            if (modalContainer) {
              modalContainer.style.width = isLargerThan992px ? '65vw' : '100vw'
              modalContainer.style.marginLeft = isLargerThan992px
                ? '20rem'
                : '0'
              modalContainer.style.marginTop = isLargerThan992px
                ? '0'
                : '7.5rem'
            }
          }
        })
      })

      const config = { childList: true, subtree: true }
      const targetNode = document.body

      observer.observe(targetNode, config)

      document.addEventListener('wheel', handleWheel)
      document.addEventListener('touchstart', handleTouchStart)
      document.addEventListener('touchmove', handleTouchMove)

      return () => {
        observer.disconnect()
        cleanUpStyles()
        document.removeEventListener('wheel', handleWheel)
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [isOpen, isLargerThan992px, initialTouchY, styleScrollbar])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      allowPinchZoom
      motionPreset="slideInBottom"
      size={{ base: 'full', lg: '4xl' }}
      scrollBehavior="inside"
    >
      <ModalContent
        bg="rgba(15, 13, 21, 0.8)"
        borderRadius="xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        pb={{ base: '10rem', lg: '0' }}
      >
        <ModalHeader textTransform={'uppercase'}>
          <Heading
            color={'white'}
            title={
              season
                ? `${SeasonModalTranslate('season')} ${season}`
                : SeasonModalTranslate('seasonModal')
            }
            tag={SeasonModalTranslate('history')}
            marginBottom={'0'}
          />
        </ModalHeader>
        {isLargerThan992px && <ModalCloseButton color={'white'} />}
        <ModalBody
          mb={'2rem'}
          overflowX={'hidden'}
          overflowY="auto"
          w={'100%'}
          pl={'7px'}
          pr={'0'}
          className="seasonModalBody"
        >
          {notInTheSeason ? (
            <Heading
              title={
                loginedUserProfile
                  ? SeasonModalTranslate('notLoggedInUser')
                  : SeasonModalTranslate('notLoggedInOther')
              }
            />
          ) : (
            <>
              <Flex
                w={'100%'}
                marginTop={'10px'}
                className="line-and-bar-graph"
                padding={{ xl: isLoading ? 0 : '20px', base: '0' }}
                borderRadius="10px"
                flexDirection={{ base: 'column', xl: 'row' }}
                backgroundColor={{ base: 'transparent', xl: '#0f0d15' }}
                backgroundImage={{
                  base: 'none',
                  xl: 'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
                }}
                boxShadow={{
                  base: 'none',
                  xl: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
                }}
                gap={{ base: '20px', xl: '0' }}
              >
                {isLoading ? (
                  <>
                    <Skeleton
                      height="200px"
                      width="100%"
                      borderRadius="10px"
                      marginRight={5}
                    />
                    <Skeleton height="200px" width="100%" borderRadius="10px" />
                  </>
                ) : (
                  <Suspense
                    fallback={
                      <Skeleton
                        height="200px"
                        width="100%"
                        borderRadius="10px"
                      />
                    }
                  >
                    <LineGraph
                      lineGraph={profile.lineGraph}
                      privateLineGraph={privacyProfileData.lineGraph}
                      loginedUserProfile={loginedUserProfile}
                      viewingHistory={true}
                      t={IQLineTranslate}
                      quantities={[
                        { label: IQLineTranslate('iqScore'), key: 'IQScore' },
                        { label: IQLineTranslate('date'), key: 'date' },
                        {
                          label: IQLineTranslate('dailyRank'),
                          key: 'dailyRank',
                        },
                      ]}
                    />
                    <IQBarGraph
                      barGraph={profile.barGraph}
                      privateBarGraph={privacyProfileData.lineGraph}
                      loginedUserProfile={loginedUserProfile}
                      viewingHistory={true}
                      t={IQBartranslate}
                    />
                  </Suspense>
                )}
              </Flex>

              <Flex
                w={'100%'}
                marginBottom="5px"
                flexDirection={{ xl: 'row', base: 'column' }}
                justifyContent="space-between"
                gap={5}
              >
                {isLoading ? (
                  <>
                    <Skeleton height="150px" width="100%" borderRadius="10px" />
                    <Skeleton height="150px" width="100%" borderRadius="10px" />
                  </>
                ) : (
                  <Suspense
                    fallback={
                      <Skeleton
                        height="150px"
                        width="100%"
                        borderRadius="10px"
                      />
                    }
                  >
                    <Flex
                      borderRadius="10px"
                      width={'100%'}
                      style={{
                        backgroundColor: '#0f0d15',
                        backgroundImage:
                          'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
                        boxShadow:
                          '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
                      }}
                      className="solved-quizzes"
                    >
                      <SolvedQuizzes
                        isDisabled={true}
                        privateSolvedQuiz={privacyProfileData.solvedQuizzes}
                        loginedUserProfile={loginedUserProfile}
                        solvedQuizzes={profile.solvedQuizzes}
                        inGameName={inGameName}
                      />
                    </Flex>
                    <Flex
                      borderRadius="10px"
                      width={'100%'}
                      style={{
                        backgroundColor: '#0f0d15',
                        backgroundImage:
                          'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
                        boxShadow:
                          '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
                      }}
                      className="rank-and-society"
                    >
                      <RankAndSociety
                        isDisabled={true}
                        privateSociety={privacyProfileData.society}
                        loginedUserProfile={loginedUserProfile}
                        USER_IQ={profile?.barGraph?.USER_IQ}
                      />
                    </Flex>
                  </Suspense>
                )}
              </Flex>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(SeasonModal)

import React, { useEffect, useState } from 'react'
import { Flex, Image, Tooltip, Text, Tag, Spinner } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import circle from '/images/circle.webp'
import Arrow from '/images/arrow.webp'
import Lightning from './RankAndSocietySubCompnents/Lightning'
import CircleAndSocietyData from '../../assets/CircleAndSocietyData'
import BrainModal from './RankAndSocietySubCompnents/BrainModal'
import CircleModal from './RankAndSocietySubCompnents/CircleModal' // Import CircleModal
import { useSelector } from 'react-redux'

const RankAndSociety = ({
  USER_IQ = 0,
  privateSociety,
  loginedUserProfile,
  isDisabled = false,
}) => {
  const { user } = useSelector(state => state.auth)
  const [circleAndSociety, setCircleAndSociety] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false) // State for BrainModal
  const [isCircleModalOpen, setIsCircleModalOpen] = useState(false) // State for CircleModal
  const [showBrainModal, setShowBrainModal] = useState(false)
  const [showCircleModal, setShowCircleModal] = useState(false)

  useEffect(() => {
    const userIQ = USER_IQ
    const circleAndSocietyData = CircleAndSocietyData
    const userCircleAndSociety = circleAndSocietyData.filter(
      data =>
        data.IQ_Lower <= userIQ &&
        (data.IQ_Upper ? data.IQ_Upper > userIQ : true),
    )

    setCircleAndSociety(userCircleAndSociety[0] || {})
    setIsLoading(false)
  }, [USER_IQ])

  const handleBrainClick = () => {
    setShowBrainModal(true)
    setIsModalOpen(true) // Open the BrainModal upon clicking the brain image
  }

  const handleCloseModal = () => {
    setIsModalOpen(false) // Close the BrainModal
  }

  const handleCircleClick = () => {
    setShowCircleModal(true)
    setIsCircleModalOpen(true) // Open the CircleModal upon clicking the circle image
  }

  const handleCloseCircleModal = () => {
    setIsCircleModalOpen(false) // Close the CircleModal
  }

  return (
    <Flex
      margin="10px"
      w="100%"
      h={'100%'}
      flexDirection="column"
      position="relative"
      p={3}
      // mt={4}
      // mr={1}
      // ml={6}
      justifyContent={'center'}
      alignItems={'center'}
    >
      {privateSociety ? (
        <Flex
          h={'100%'}
          w={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Text
            backgroundColor="#0f0d15"
            m={0}
            top={0}
            right={10}
            color={'#9CAFAA'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            w={'60px'}
            height={'30px'}
          >
            Hidden
          </Text>
        </Flex>
      ) : isLoading ? (
        <Spinner />
      ) : (
        <>
          <Flex flexDirection="column" width="100%" h={'100%'} m={0}>
            <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
              Society and Circle
            </Text>
            {loginedUserProfile && (
              <Tooltip label="Visibility to others">
                <Tag
                  backgroundColor="#0f0d15"
                  m={0}
                  position={'absolute'}
                  top={0}
                  right={2}
                  color={'#9CAFAA'}
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  w={'60px'}
                  height={'30px'}
                >
                  {user.profilePrivacy.society ? 'HIDDEN' : 'VISIBLE'}
                </Tag>
              </Tooltip>
            )}
          </Flex>
          <Flex
            mt={5}
            flexDirection="column"
            w="100%"
            m={0}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Flex width="100%" justifyContent={'center'} alignItems={'center'}>
              <motion.button
                whileHover={!isDisabled && { scale: 1.1 }}
                whileTap={!isDisabled && { scale: 0.9 }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  height: '100%',
                  cursor: isDisabled ? 'default' : 'pointer',
                }}
              >
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  w="100%"
                  position="relative"
                  flexDirection="column"
                  onClick={!isDisabled ? handleBrainClick : null} // Add onClick handler to the brain image
                  style={{ cursor: isDisabled ? 'default' : 'pointer' }} // Change cursor to pointer to indicate it's clickable
                  h={'100%'}
                >
                  <Flex
                    justifyContent={'center'}
                    alignItems={'center'}
                    w={'100%'}
                    height={'100%'}
                  >
                    <motion.img
                      src={circleAndSociety.image}
                      alt="Brain"
                      style={{
                        width: '6.5rem',
                        height: '6.5rem',
                        background: 'transparent',
                      }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    />
                    <Lightning />
                  </Flex>

                  <Text
                    textAlign="center"
                    fontSize="lg"
                    fontWeight="bold"
                    color="#436850"
                    textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                    m={0}
                    p={0}
                  >
                    {circleAndSociety.society}
                  </Text>
                </Flex>
              </motion.button>
              <Flex
                width="80%"
                alignItems="center"
                justifyContent="center"
                h={'100%'}
              >
                <Image
                  w="4rem"
                  h="4rem"
                  background="transparent"
                  mt={-10}
                  src={Arrow}
                />
              </Flex>
              <motion.button
                whileHover={!isDisabled && { scale: 1.1 }}
                whileTap={!isDisabled && { scale: 0.9 }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  height: '100%',
                  cursor: isDisabled ? 'default' : 'pointer',
                }}
              >
                <Flex
                  flexDirection={'column'}
                  w="100%"
                  h={'100%'}
                  position="relative"
                  onClick={!isDisabled ? handleCircleClick : null}
                  justifyContent={'center'}
                  alignItems={'center'}
                  cursor={isDisabled ? 'default' : 'pointer'}
                >
                  <img
                    src={circle}
                    alt="Circle"
                    style={{
                      width: '8.5rem',
                      height: '8.5rem',
                      background: 'transparent',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '4.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {circleAndSociety.IQ_Upper != null &&
                    circleAndSociety.IQ_Lower != 150 ? (
                      <div
                        style={{
                          position: 'absolute',

                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            color: '#9CAFAA',
                            fontSize: '0.8rem',
                            margin: 0,
                          }}
                        >
                          {circleAndSociety.IQ_Lower}
                        </span>
                        <span
                          style={{
                            color: '#9CAFAA',
                            fontSize: '0.8rem',
                            margin: 0,
                          }}
                        >
                          to
                        </span>
                        <span
                          style={{
                            color: '#9CAFAA',
                            fontSize: '0.8rem',
                            margin: 0,
                            width: '60px',
                          }}
                        >
                          {circleAndSociety.IQ_Upper} IQ
                        </span>
                      </div>
                    ) : (
                      <>
                        <span
                          style={{
                            position: 'absolute',
                            color: '#9CAFAA',
                            fontSize: '0.8rem',
                            top: '-1rem',
                          }}
                        >
                          {circleAndSociety.IQ_Lower}+
                        </span>
                        <span
                          style={{
                            color: '#9CAFAA',
                            fontSize: '0.8rem',
                            margin: 0,
                          }}
                        >
                          IQ
                        </span>
                      </>
                    )}
                  </div>
                  <Text
                    textAlign="center"
                    fontSize="lg"
                    fontWeight="bold"
                    color="#436850"
                    textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                    m={0}
                    p={0}
                  >
                    {circleAndSociety.circle}
                  </Text>
                </Flex>
              </motion.button>
            </Flex>
            <Flex
              mt={5}
              w="100%"
              alignItems="center"
              justifyContent="space-between"
            ></Flex>
          </Flex>
        </>
      )}
      {/* Modals */}
      {showBrainModal && (
        <BrainModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          currentUserSociety={circleAndSociety.society.split(' ')[0]}
          setShowBrainModal={setShowBrainModal}
        />
      )}
      {showCircleModal && (
        <CircleModal
          isOpen={isCircleModalOpen}
          onClose={handleCloseCircleModal}
          currentUserCircle={
            circleAndSociety.circle ? circleAndSociety.circle.split(' ')[0] : ''
          }
          setShowCircleModal={setShowCircleModal}
        />
      )}
    </Flex>
  )
}

export default RankAndSociety

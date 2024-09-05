import {
  Box,
  Button,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../../../redux/authSlice'
import useSound from '../../../customHooks/useSound'
import { useTranslation } from 'react-i18next'

const ToggleProfileVisibility = ({ setShowHideModal, isGuest }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const { t } = useTranslation('ToggleProfileVisibility') // Initialize i18n translation hook
  const [load, setLoad] = useState(false)
  const { playClick } = useSound()
  const dispatchRedux = useDispatch()
  const { user } = useSelector(state => state.auth)

  const [hide, setHide] = useState({
    fullProfile: user.profilePrivacy ? user.profilePrivacy.fullProfile : false,
    lineGraph: user.profilePrivacy ? user?.profilePrivacy.lineGraph : false,
    barGraph: user.profilePrivacy ? user?.profilePrivacy.barGraph : false,
    solvedQuizzes: user.profilePrivacy
      ? user?.profilePrivacy.solvedQuizzes
      : false,
    society: user.profilePrivacy ? user?.profilePrivacy.society : false,
    seasonAnalytics: user.profilePrivacy
      ? user?.profilePrivacy.seasonAnalytics
      : false,
  })
  const [Guesthide, setGuestHide] = useState({
    fullProfile: user.profilePrivacy ? user.profilePrivacy.fullProfile : false,
    solvedQuizzes: user.profilePrivacy
      ? user?.profilePrivacy.solvedQuizzes
      : false,
  })

  useEffect(() => {
    onOpen()
  }, [])

  const handleToggleVisibility = key => {
    if (key === 'fullProfile' && !isGuest) {
      const isFullProfileVisible = !hide[key]
      setHide(prevHide => ({
        ...prevHide,
        fullProfile: isFullProfileVisible,
        lineGraph: isFullProfileVisible,
        barGraph: isFullProfileVisible,
        solvedQuizzes: isFullProfileVisible,
        society: isFullProfileVisible,
      }))
    } else if (key === 'fullProfile' && isGuest) {
      const isFullProfileVisible = !Guesthide[key]
      setGuestHide(prevHide => ({
        ...prevHide,
        fullProfile: isFullProfileVisible,
        solvedQuizzes: isFullProfileVisible,
      }))
    } else if (key !== 'fullProfile' && !isGuest) {
      setHide(prevHide => ({
        ...prevHide,
        [key]: !prevHide[key],
      }))
    } else if (key !== 'fullProfile' && isGuest) {
      setGuestHide(prevHide => ({
        ...prevHide,
        [key]: !prevHide[key],
      }))
    }
  }

  const handleSave = async () => {
    playClick()
    setLoad(true)
    try {
      const response = await axios.post('/api/user/profilePrivacy', {
        ...hide,
      })
      if (response.status === 200) {
        toast({
          title: t('success'),
          description: t('profileVisibility.savedSuccessfully'),
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })

        dispatchRedux(setUser({ ...user, profilePrivacy: hide }))
        setShowHideModal(false)
        onClose()
      }
    } catch (error) {
      console.log(error)
      toast({
        title: t('error'),
        description: t('profileVisibility.errorSaving'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })

      console.log(error)
    } finally {
      setLoad(false)
    }
  }

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={() => {
        setShowHideModal(false)
        onClose()
      }}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor={{ base: '#0f0d15' }}
        backgroundImage={{
          base: 'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
        }}
        boxShadow={{
          base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
        }}
        backgroundSize="400% 400%"
        borderRadius="10px"
      >
        <ModalHeader as="h3" size="lg" color="white" textAlign="center">
          {t('profileVisibility.toggleVisibility')}
        </ModalHeader>
        <ModalCloseButton color={'white'} isDisabled={load} />
        <ModalBody>
          <Box
            maxH={{ base: '80vh', md: '50vh' }}
            overflowY="scroll"
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            <Grid
              templateColumns={'repeat(2,4fr)'}
              color={'white'}
              gap={6}
              margin={2}
            >
              {!isGuest ? (
                <>
                  {Object.entries(hide).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <GridItem colSpan={1}>
                        {t(`profileVisibility.${key}`)}
                      </GridItem>
                      <GridItem colSpan={1}>
                        {value ? (
                          <ViewOffIcon
                            _hover={{ cursor: 'pointer' }}
                            onClick={() => handleToggleVisibility(key)}
                          />
                        ) : (
                          <ViewIcon
                            _hover={{ cursor: 'pointer' }}
                            onClick={() => handleToggleVisibility(key)}
                          />
                        )}
                      </GridItem>
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <>
                  {Object.entries(Guesthide).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <GridItem colSpan={1}>
                        {t(`profileVisibility.${key}`)}
                      </GridItem>
                      <GridItem colSpan={1}>
                        {value ? (
                          <ViewOffIcon
                            _hover={{ cursor: 'pointer' }}
                            onClick={() => handleToggleVisibility(key)}
                          />
                        ) : (
                          <ViewIcon
                            _hover={{ cursor: 'pointer' }}
                            onClick={() => handleToggleVisibility(key)}
                          />
                        )}
                      </GridItem>
                    </React.Fragment>
                  ))}
                </>
              )}
            </Grid>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSave} isLoading={load}>
            {t('save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ToggleProfileVisibility

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
import React, { useContext, useEffect, useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons' // Import ViewOffIcon for visibility off
import { AppContext } from '../../../contextAPI/appContext'
import axios from 'axios'

const ToggleProfileVisibility = ({ setShowHideModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [load, setLoad] = useState(false)
  const { state, dispatch, playClick } = useContext(AppContext)
  const [hide, setHide] = useState({
    fullProfile: state.user.profilePrivacy
      ? state.user.profilePrivacy.fullProfile
      : false,
    lineGraph: state.user.profilePrivacy
      ? state.user?.profilePrivacy.lineGraph
      : false,
    barGraph: state.user.profilePrivacy
      ? state.user?.profilePrivacy.barGraph
      : false,
    solvedQuizzes: state.user.profilePrivacy
      ? state.user?.profilePrivacy.solvedQuizzes
      : false,
    // dailyActivity: state.user.profilePrivacy
    //   ? state.user?.profilePrivacy.dailyActivity
    //   : false,
    society: state.user.profilePrivacy
      ? state.user?.profilePrivacy.society
      : false,
    seasonAnalytics: state.user.profilePrivacy
      ? state.user?.profilePrivacy.seasonAnalytics
      : false,
  })
  useEffect(() => {
    onOpen()
  }, [])

  const handleToggleVisibility = key => {
    if (key === 'fullProfile') {
      // If fullProfile is toggled, set every other option accordingly
      const isFullProfileVisible = !hide[key]
      setHide(prevHide => ({
        ...prevHide,
        fullProfile: isFullProfileVisible,
        lineGraph: isFullProfileVisible,
        barGraph: isFullProfileVisible,
        solvedQuizzes: isFullProfileVisible,
        // dailyActivity: isFullProfileVisible,
        society: isFullProfileVisible,
      }))
    } else {
      // If any other option is toggled, just toggle that option
      setHide(prevHide => ({
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
          title: 'Success',
          description: 'Profile visibility saved successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
        const updatedUser = state.user
        updatedUser.profilePrivacy = hide
        dispatch({ type: 'setUser', payloadUser: updatedUser })
        setShowHideModal(false)
        onClose()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error in saving profile visibility',
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
    <>
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
            Toggle Profile Visibility
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
                {Object.entries(hide).map(([key, value]) => (
                  <React.Fragment key={key}>
                    <GridItem colSpan={1}>{key}</GridItem>
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
              </Grid>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSave} isLoading={load}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ToggleProfileVisibility

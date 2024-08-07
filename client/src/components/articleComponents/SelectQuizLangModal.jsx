import React, { useEffect } from 'react'
import {
  ModalBody,
  Heading,
  Box,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import useSound from '../../customHooks/useSound'

const SelectQuizLangModal = ({ setShowQuizLangModal, setSelectLanForQuiz }) => {
  const { playClick } = useSound()

  const handleLanguageChange = e => {
    setSelectLanForQuiz(e.target.value)
  }
  const { isOpen, onOpen, onClose } = useDisclosure()
  useEffect(() => {
    setSelectLanForQuiz('english')
    onOpen()
  }, [])
  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        size={{ base: 'full', md: '3xl' }}
      >
        <ModalOverlay />
        <ModalContent
          // background="linear-gradient(-45deg, #092635, #9EC8B9, #1B4242, #9EC8B9)"
          backgroundColor={{ base: '#0f0d15', xl: 'transparent' }}
          backgroundImage={{
            base: 'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
          }}
          boxShadow={{
            base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
          }}
          backgroundSize="400% 400%"
          borderRadius="10px"
          //boxShadow="0 0 10px rgba(0, 0, 0, 0.5)" // Added boxShadow to make it standout
        >
          <ModalBody
            p={'15px'}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            width={'100%'}
            color={'black'}
          >
            <Heading as="h1" size={'xl'} mb={4} color={'white'}>
              Select Language
            </Heading>

            <Box>
              <Select
                variant="outline"
                w={'150px'}
                backgroundColor={'#2A2F4F'}
                defaultValue="english"
                onChange={handleLanguageChange}
                color={'white'}
              >
                <option style={{ backgroundColor: '#2A2F4F' }} value="english">
                  English
                </option>
                <option style={{ backgroundColor: '#2A2F4F' }} value="hindi">
                  Hindi
                </option>
              </Select>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                playClick()
                onClose()
                setShowQuizLangModal(false)
              }}
            >
              Next
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SelectQuizLangModal

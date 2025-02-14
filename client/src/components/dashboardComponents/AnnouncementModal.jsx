import React, { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Box,
  Text,
  useToast,
  Divider,
  Switch,
  FormHelperText,
} from '@chakra-ui/react'
import axios from 'axios'
import LazyNotificationContent from '../Header-Footer/Inbox/LazyNotificationContent'

const AnnouncementModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('')
  const [mainText, setMainText] = useState('')
  const [pushNotificationText, setPushNotificationText] = useState('')
  const [img, setImg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const toast = useToast()

  const previewNotification = {
    title,
    mainText,
    img,
    date: new Date(),
  }

  const previewUser = {
    name: 'Preview User',
  }

  const handleSubmit = async () => {
    if (!title || !mainText) {
      toast({
        title: 'Error',
        description: 'Title and main text are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      setLoading(true)
      await axios.post('/api/admin/announcement', {
        title,
        mainText,
        img,
        pushNotificationText: pushNotificationText || mainText,
      })

      toast({
        title: 'Success',
        description: 'Announcement sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to send announcement',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent
        bg="linear-gradient(180deg, #1E1533 0%, #0A0813 100%)"
        color="white"
      >
        <ModalHeader>Create Global Announcement</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                bg="whiteAlpha.100"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Main Text</FormLabel>
              <Textarea
                value={mainText}
                onChange={e => setMainText(e.target.value)}
                placeholder="Enter announcement content"
                minH="150px"
                bg="whiteAlpha.100"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={img}
                onChange={e => setImg(e.target.value)}
                placeholder="Enter image URL (optional)"
                bg="whiteAlpha.100"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Push Notification Text</FormLabel>
              <Textarea
                value={pushNotificationText}
                onChange={e => setPushNotificationText(e.target.value)}
                placeholder="Enter custom push notification text (optional)"
                bg="whiteAlpha.100"
              />
              <FormHelperText color="whiteAlpha.700">
                If left empty, main text will be used for push notification
              </FormHelperText>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Show Preview</FormLabel>
              <Switch
                isChecked={showPreview}
                onChange={e => setShowPreview(e.target.checked)}
                colorScheme="purple"
              />
            </FormControl>

            {showPreview && (
              <Box w="100%" mt={4}>
                <Divider my={4} />
                <Text mb={4} fontSize="lg" fontWeight="bold">
                  Preview
                </Text>
                <Box
                  bg="whiteAlpha.50"
                  borderRadius="lg"
                  p={6}
                  backdropFilter="blur(8px)"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <LazyNotificationContent
                    selectedNotification={previewNotification}
                    user={previewUser}
                    formattedDate={new Date().toLocaleString()}
                  />
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Sending..."
          >
            Send Announcement
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AnnouncementModal

// MaintenanceModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Box,
} from '@chakra-ui/react'

export default function MaintenanceModal({ isOpen, onClose }) {
  const [maintenanceWindows, setMaintenanceWindows] = useState([])
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    reason: '',
  })
  const toast = useToast()

  useEffect(() => {
    fetchMaintenanceWindows()
  }, [])

  const fetchMaintenanceWindows = async () => {
    try {
      const response = await fetch('/api/admin/maintenance', {
        credentials: 'include',
      })
      const data = await response.json()
      setMaintenanceWindows(data.maintenanceWindows)
    } catch (error) {
      toast({
        title: 'Error fetching maintenance windows',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast({
          title: 'Maintenance window scheduled',
          status: 'success',
          duration: 3000,
        })
        fetchMaintenanceWindows()
        setFormData({ startTime: '', endTime: '', reason: '' })
      }
    } catch (error) {
      toast({
        title: 'Error scheduling maintenance',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleAction = async (id, action) => {
    try {
      const response = await fetch(`/api/admin/maintenance/${id}/${action}`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast({
          title: `Maintenance ${action} successful`,
          status: 'success',
          duration: 3000,
        })
        fetchMaintenanceWindows()
      }
    } catch (error) {
      toast({
        title: `Error ${action} maintenance`,
        status: 'error',
        duration: 3000,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent
        bg="gray.800"
        color="white"
        borderRadius="xl"
        boxShadow="dark-lg"
      >
        <ModalHeader borderBottom="1px" borderColor="gray.700" py={4}>
          Maintenance Management
        </ModalHeader>
        <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
        <ModalBody pb={6}>
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel color="gray.300">Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={e =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  bg="gray.700"
                  border="none"
                  color="white"
                  _hover={{ bg: 'gray.600' }}
                  _focus={{ bg: 'gray.600', borderColor: 'blue.300' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="gray.300">End Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={e =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  bg="gray.700"
                  border="none"
                  color="white"
                  _hover={{ bg: 'gray.600' }}
                  _focus={{ bg: 'gray.600', borderColor: 'blue.300' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="gray.300">Reason</FormLabel>
                <Textarea
                  value={formData.reason}
                  onChange={e =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  bg="gray.700"
                  border="none"
                  color="white"
                  _hover={{ bg: 'gray.600' }}
                  _focus={{ bg: 'gray.600', borderColor: 'blue.300' }}
                  resize="vertical"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                bg="blue.500"
                _hover={{ bg: 'blue.600' }}
                _active={{ bg: 'blue.700' }}
              >
                Schedule Maintenance
              </Button>
            </VStack>
          </Box>

          <Box overflowX="auto" mt={8}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.300" borderColor="gray.600">
                    Start Time
                  </Th>
                  <Th color="gray.300" borderColor="gray.600">
                    End Time
                  </Th>
                  <Th color="gray.300" borderColor="gray.600">
                    Status
                  </Th>
                  <Th color="gray.300" borderColor="gray.600">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {maintenanceWindows.map(window => (
                  <Tr key={window._id} _hover={{ bg: 'gray.700' }}>
                    <Td borderColor="gray.600">
                      {new Date(window.startTime).toLocaleString()}
                    </Td>
                    <Td borderColor="gray.600">
                      {new Date(window.endTime).toLocaleString()}
                    </Td>
                    <Td borderColor="gray.600">
                      <Box
                        px={2}
                        py={1}
                        borderRadius="md"
                        bg={
                          window.status === 'scheduled'
                            ? 'yellow.600'
                            : window.status === 'in-progress'
                            ? 'green.600'
                            : window.status === 'completed'
                            ? 'blue.600'
                            : 'red.600'
                        }
                        display="inline-block"
                      >
                        {window.status}
                      </Box>
                    </Td>
                    <Td borderColor="gray.600">
                      {window.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            bg="green.500"
                            _hover={{ bg: 'green.600' }}
                            mr={2}
                            onClick={() => handleAction(window._id, 'start')}
                          >
                            Start
                          </Button>
                          <Button
                            size="sm"
                            bg="red.500"
                            _hover={{ bg: 'red.600' }}
                            onClick={() => handleAction(window._id, 'cancel')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {window.status === 'in-progress' && (
                        <Button
                          size="sm"
                          bg="blue.500"
                          _hover={{ bg: 'blue.600' }}
                          onClick={() => handleAction(window._id, 'end')}
                        >
                          End
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

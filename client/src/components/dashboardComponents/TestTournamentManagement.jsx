import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Input,
  Text,
  useToast,
  Box,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'

const TestTournamentManagement = ({ isOpen, onClose }) => {
  const [testTournament, setTestTournament] = useState(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [registrationStartDate, setRegistrationStartDate] = useState('')
  const [registrationStartTime, setRegistrationStartTime] = useState('')
  const [registrationEndDate, setRegistrationEndDate] = useState('')
  const [registrationEndTime, setRegistrationEndTime] = useState('')
  const toast = useToast()

  const fetchTestTournament = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const response = await axios.get(
        '/api/admin/tournament/test/latest',
        config,
      )
      setTestTournament(response.data)
      if (response.data) {
        const [sDate, sTime] = response.data.startDate.split('T')
        const [eDate, eTime] = response.data.endDate.split('T')
        const [rsDate, rsTime] = response.data.registrationStartDate.split('T')
        const [reDate, reTime] = response.data.registrationEndDate.split('T')

        setStartDate(sDate)
        setStartTime(sTime.slice(0, 5))
        setEndDate(eDate)
        setEndTime(eTime.slice(0, 5))
        setRegistrationStartDate(rsDate)
        setRegistrationStartTime(rsTime.slice(0, 5))
        setRegistrationEndDate(reDate)
        setRegistrationEndTime(reTime.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching test tournament:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch test tournament',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (isOpen) {
      fetchTestTournament()
    }
  }, [isOpen, fetchTestTournament])

  const combineDateAndTime = (date, time) => {
    return `${date}T${time}:00`
  }

  const handleCreateTestTournament = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.post(
        '/api/admin/tournament/test',
        {
          startDate: combineDateAndTime(startDate, startTime),
          endDate: combineDateAndTime(endDate, endTime),
          registrationStartDate: combineDateAndTime(
            registrationStartDate,
            registrationStartTime,
          ),
          registrationEndDate: combineDateAndTime(
            registrationEndDate,
            registrationEndTime,
          ),
        },
        config,
      )
      toast({
        title: 'Success',
        description: 'Test tournament created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      fetchTestTournament()
    } catch (error) {
      console.error('Error creating test tournament:', error)
      toast({
        title: 'Error',
        description: 'Failed to create test tournament',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleUpdateTestTournament = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.put(
        `/api/admin/tournament/test/${testTournament._id}`,
        {
          startDate: combineDateAndTime(startDate, startTime),
          endDate: combineDateAndTime(endDate, endTime),
          registrationStartDate: combineDateAndTime(
            registrationStartDate,
            registrationStartTime,
          ),
          registrationEndDate: combineDateAndTime(
            registrationEndDate,
            registrationEndTime,
          ),
        },
        config,
      )
      toast({
        title: 'Success',
        description: 'Test tournament updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      fetchTestTournament()
    } catch (error) {
      console.error('Error updating test tournament:', error)
      toast({
        title: 'Error',
        description: 'Failed to update test tournament',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDeleteTestTournament = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this test tournament? This action cannot be undone.',
      )
    ) {
      try {
        const token = localStorage.getItem('token')
        const config = { headers: { Authorization: `Bearer ${token}` } }
        await axios.delete(
          `/api/admin/tournament/test/${testTournament._id}`,
          config,
        )
        toast({
          title: 'Success',
          description: 'Test tournament deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        setTestTournament(null)
        setStartDate('')
        setStartTime('')
        setEndDate('')
        setEndTime('')
        setRegistrationStartDate('')
        setRegistrationStartTime('')
        setRegistrationEndDate('')
        setRegistrationEndTime('')
      } catch (error) {
        console.error('Error deleting test tournament:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete test tournament',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Test Tournament</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Start Date and Time</FormLabel>
                <HStack>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>End Date and Time</FormLabel>
                <HStack>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>Registration Start Date and Time</FormLabel>
                <HStack>
                  <Input
                    type="date"
                    value={registrationStartDate}
                    onChange={e => setRegistrationStartDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={registrationStartTime}
                    onChange={e => setRegistrationStartTime(e.target.value)}
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>Registration End Date and Time</FormLabel>
                <HStack>
                  <Input
                    type="date"
                    value={registrationEndDate}
                    onChange={e => setRegistrationEndDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={registrationEndTime}
                    onChange={e => setRegistrationEndTime(e.target.value)}
                  />
                </HStack>
              </FormControl>
              {testTournament && (
                <Box>
                  <Text>Current Test Tournament:</Text>
                  <Text>
                    Tournament Number: {testTournament.tournamentNumber}
                  </Text>
                  <Text>Status: {testTournament.status}</Text>
                </Box>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button onClick={handleCreateTestTournament} colorScheme="blue">
              Create Test Tournament
            </Button>
            {testTournament && (
              <>
                <Button
                  onClick={handleUpdateTestTournament}
                  colorScheme="green"
                >
                  Update Test Tournament
                </Button>
                <Button onClick={handleDeleteTestTournament} colorScheme="red">
                  Delete Test Tournament
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TestTournamentManagement

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'

const TournamentManagement = ({ isOpen, onClose }) => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchTournaments()
    }
  }, [isOpen])

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('/api/admin/tournament/all')
      setTournaments(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournaments',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleMaintenanceToggle = async (id, currentStatus) => {
    try {
      await axios.put(`/api/admin/tournament/${id}/maintenance`, {
        isUnderMaintenance: !currentStatus,
      })

      setTournaments(prevTournaments =>
        prevTournaments.map(tournament =>
          tournament._id === id
            ? { ...tournament, isUnderMaintenance: !currentStatus }
            : tournament,
        ),
      )

      toast({
        title: 'Success',
        description: 'Tournament maintenance status updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error updating maintenance status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update maintenance status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tournament Management</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Box>Loading tournaments...</Box>
          ) : (
            <>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Tournament Number</Th>
                    <Th>Name</Th>
                    <Th>Under Maintenance</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tournaments.map(tournament => (
                    <Tr key={tournament._id}>
                      <Td>{tournament.tournamentNumber}</Td>
                      <Td>{tournament.name}</Td>
                      <Td>
                        <Switch
                          isChecked={tournament.isUnderMaintenance}
                          onChange={() =>
                            handleMaintenanceToggle(
                              tournament._id,
                              tournament.isUnderMaintenance,
                            )
                          }
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Button mt={4} onClick={fetchTournaments}>
                Refresh Tournaments
              </Button>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default TournamentManagement

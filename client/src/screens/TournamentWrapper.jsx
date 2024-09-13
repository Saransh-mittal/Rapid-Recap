import React, { useEffect, useState } from 'react'
import { Box, Center, Spinner } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import ComingSoonTournament from './ComingSoonTournament'
import Tournament from './Tournament'

const TournamentWrapper = () => {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    const checkAuthorization = async () => {
      if (user && user._id) {
        try {
          const response = await axios.get(`/api/tournament/authorize`)
          setIsAuthorized(response.data.isAuthorized)
        } catch (error) {
          console.error('Error checking authorization:', error)
          setIsAuthorized(false)
        }
      } else {
        setIsAuthorized(false)
      }
      setIsLoading(false)
    }

    checkAuthorization()
  }, [user])

  if (isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="pink.500" />
      </Center>
    )
  }

  return <Box>{isAuthorized ? <Tournament /> : <ComingSoonTournament />}</Box>
}

export default TournamentWrapper

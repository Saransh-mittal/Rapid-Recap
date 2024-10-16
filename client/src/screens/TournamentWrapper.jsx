import React, { useEffect, useState } from 'react'
import { Box, Center } from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import ComingSoonTournament from './ComingSoonTournament'
import Tournament from './Tournament'
import ServiceScreen from './ServiceScreen'
import FullScreenLoadingSpinner from '../components/tournamentComponents/tournamentQuiz/FullScreenLoadingSpinner'
import { setIsUnderMaintenance } from '../redux/tournamentSlice'

const TournamentWrapper = () => {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { user, loginCheckStatus } = useSelector(state => state.auth)
  const { isUnderMaintenance } = useSelector(state => state.tournament)
  const dispatch = useDispatch()
  useEffect(() => {
    const checkAuthorization = async () => {
      if (user && user._id) {
        try {
          const response = await axios.get(`/api/tournament/authorize`)
          setIsAuthorized(response.data.isAuthorized)
          dispatch(setIsUnderMaintenance(response.data.isUnderMaintenance))
        } catch (error) {
          console.error('Error checking authorization:', error)
          setIsAuthorized(false)
        }
      } else {
        setIsAuthorized(false)
      }
      if (loginCheckStatus === 'pending') return
      setIsLoading(false)
    }

    checkAuthorization()
  }, [user, loginCheckStatus])

  if (isLoading) {
    return (
      <Center height="100vh">
        <FullScreenLoadingSpinner />
      </Center>
    )
  }

  if (isUnderMaintenance) {
    return (
      <ServiceScreen
        title="Tournament Under Maintenance"
        description="We're enhancing our tournament system to provide you with an even more thrilling gaming experience. Please check back soon to join the action."
        quote="The key is not the will to win… everybody has that. It is the will to prepare to win that is important."
        quoteAuthor="Bobby Knight"
      />
    )
  }

  // return <Box>{isAuthorized ? <Tournament /> : <ComingSoonTournament />}</Box>
  return (
    <Box>
      <Tournament />
    </Box>
  )
}

export default TournamentWrapper

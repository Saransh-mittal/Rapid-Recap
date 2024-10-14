import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setOtherUserProfiles, setUserProfile } from '../redux/contentSlice'

export const useProfile = () => {
  const { inGameName } = useParams()
  const { user } = useSelector(state => state.auth)
  const { userProfile, otherUserProfiles } = useSelector(state => state.content)
  const dispatchRedux = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const [profile, setProfile] = useState(userProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [privacyProfileData, setPrivacyProfileData] = useState({
    fullProfile: false,
    lineGraph: false,
    barGraph: false,
    solvedQuizzes: false,
    society: false,
    seasonAnalytics: false,
    tournamentAnalytics: false,
  })

  const loginedUserProfile = inGameName === user?.inGameName

  const fetchProfile = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100000))
      const response = await axios.get(`/api/user/profile/${inGameName}`)
      setProfile(() => response.data)
      if (inGameName === user?.inGameName) {
        dispatchRedux(setUserProfile(response.data))
        localStorage.setItem('userProfile', JSON.stringify(response.data))
      } else {
        setPrivacyProfileData(() => response.data.profilePrivacy)
        dispatchRedux(
          setOtherUserProfiles([
            ...otherUserProfiles,
            { profile: response.data, inGameName: inGameName },
          ]),
        )
      }
    } catch (error) {
      console.log(error)
      if (error.response?.status === 404) {
        toast({
          title: 'User not found',
          description: 'The user you are looking for does not exist',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        navigate('/')
      }
    } finally {
      setIsLoading(false)
    }
  }, [dispatchRedux, inGameName, otherUserProfiles, user?.inGameName])

  useEffect(() => {
    document.title = `${user?.inGameName}'s Rapid Recap Profile | IQ Score: ${user?.USER_IQ}`

    const otherUserStored = otherUserProfiles?.find(
      user => user?.inGameName === inGameName,
    )

    if (inGameName === user?.inGameName) {
      const cachedProfile = localStorage.getItem('userProfile')
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile)
        setProfile(parsedProfile)
        setIsLoading(false)
        fetchProfile()
      } else if (userProfile) {
        setProfile(userProfile)
        setIsLoading(false)
      } else {
        fetchProfile()
      }
    } else if (otherUserStored) {
      setProfile(otherUserStored.profile)
      setPrivacyProfileData(
        otherUserStored.profile.profilePrivacy || privacyProfileData,
      )
      setIsLoading(false)
    } else {
      fetchProfile()
    }
  }, [inGameName, user, otherUserProfiles])

  return {
    profile,
    isLoading,
    user,
    inGameName,
    privacyProfileData,
    loginedUserProfile,
  }
}

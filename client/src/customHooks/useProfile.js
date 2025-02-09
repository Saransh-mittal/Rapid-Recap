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

  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [privacyProfileData, setPrivacyProfileData] = useState({
    fullProfile: false,
    lineGraph: false,
    barGraph: false,
    solvedQuizzes: false,
    society: false,
    seasonAnalytics: false,
    monthlyAnalytics: false,
    tournamentAnalytics: false,
  })

  const loginedUserProfile = inGameName === user?.inGameName

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(`/api/user/profile/${inGameName}`)

      setProfile(response.data)
      if (loginedUserProfile) {
        dispatchRedux(setUserProfile(response.data))
        localStorage.setItem('userProfile', JSON.stringify(response.data))
      } else {
        setPrivacyProfileData(response.data.profilePrivacy)
        dispatchRedux(
          setOtherUserProfiles([
            ...otherUserProfiles.filter(p => p.inGameName !== inGameName),
            { profile: response.data, inGameName: inGameName },
          ]),
        )
      }
    } catch (error) {
      console.error(`Error fetching profile for ${inGameName}:`, error)
      if (error.response?.status === 404 || error.response?.status === 410) {
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
  }, [
    dispatchRedux,
    inGameName,
    otherUserProfiles,
    loginedUserProfile,
    navigate,
    toast,
  ])

  useEffect(() => {
    setProfile(null)

    const loadProfile = async () => {
      if (loginedUserProfile) {
        // Load user's own profile
        const cachedProfile = localStorage.getItem('userProfile')
        if (cachedProfile) {
          const parsedProfile = JSON.parse(cachedProfile)
          setProfile(parsedProfile)
          setIsLoading(false)
        } else setIsLoading(true)
        // Always fetch to ensure up-to-date data
        await fetchProfile()
      } else {
        setIsLoading(true)
        // Load other user's profile
        const otherUserStored = otherUserProfiles?.find(
          user => user?.inGameName === inGameName,
        )
        if (otherUserStored) {
          setProfile(otherUserStored.profile)
          setPrivacyProfileData(
            otherUserStored.profile.profilePrivacy || privacyProfileData,
          )
          setIsLoading(false)
        }

        // Always fetch for other users to ensure data is up-to-date
        await fetchProfile()
      }
    }

    loadProfile()
  }, [inGameName, user?._id])

  return {
    profile,
    isLoading,
    user,
    inGameName,
    privacyProfileData,
    loginedUserProfile,
  }
}

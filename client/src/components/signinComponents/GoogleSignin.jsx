import React from 'react'
import { Button, Flex, Text } from '@chakra-ui/react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

export default function GoogleSignin({
  setData,
  dispatchRedux,
  handleGoogleResponse,
  setEnterInGameName,
  setLoginCheckStatus,
  t,
}) {
  const handleGoogleSuccess = async credentialResponse => {
    setData(prevData => ({
      ...prevData,
      credentialResponse,
    }))
    dispatchRedux(setLoginCheckStatus('pending'))
    try {
      const response = await axios.post('/api/user/handleGoogleLogin', {
        credentialResponse,
      })
      if (response.data.EnterInGameName) {
        toast({
          title: t('enter_in_game_name'),
          description: t('enter_in_game_name_message'),
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        setEnterInGameName(true)
      } else {
        handleGoogleResponse(response)
      }
    } catch (error) {
      console.error(error.response.data.error)
      if (error.response.data.EnterInGameName) setEnterInGameName(true)
      toast({
        title: t('login_failed'),
        description: error.response.data.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      dispatchRedux(setLoginCheckStatus('fulfilled'))
    }
  }

  return (
    <>
      <Flex w={'100%'} justifyContent={'center'}>
        <Button my={4} p={0}>
          <GoogleOAuthProvider clientId="492859619634-m81f6tnro73fg6sflkuj0nemm1g6aecb.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log(t('login_failed'))
              }}
            />
          </GoogleOAuthProvider>
        </Button>
      </Flex>
      <Flex w={'100%'} justifyContent={'center'} mb={4}>
        <Text color={'gray.400'} fontWeight={'bold'}>
          {t('or_text')}
        </Text>
      </Flex>
    </>
  )
}

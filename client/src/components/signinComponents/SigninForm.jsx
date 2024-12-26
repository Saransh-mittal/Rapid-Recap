import React from 'react'
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  Flex,
} from '@chakra-ui/react'
import FillEyeInvisible from '../../assets/svg/FillEyeInvisible'
import FillEyeVisible from '../../assets/svg/FillEyeVisible'

export default function SigninForm({
  data,
  setData,
  inputHandler,
  handleSubmit,
  load,
  handleKeyPress,
  emailOrInGameNameRef,
  t,
  onClose,
  dispatchRedux,
  setIsRegisterOpen,
  handleForgotPasswordThrottled,
}) {
  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
      <InputGroup>
        <Input
          ref={emailOrInGameNameRef}
          onChange={inputHandler}
          name="emailOrInGameName"
          value={data.emailOrInGameName}
          type="text"
          placeholder={t('email_or_in_game_name_placeholder')}
          color="white"
        />
      </InputGroup>
      <InputGroup mt={4}>
        <Input
          onChange={inputHandler}
          name="password"
          value={data.password}
          type={data.showPassword ? 'text' : 'password'}
          placeholder={t('enter_password')}
          color="white"
        />
        <InputRightElement width="4.5rem">
          <IconButton
            style={{ backgroundColor: 'transparent', color: 'white' }}
            onClick={() =>
              setData(prevData => ({
                ...prevData,
                showPassword: !prevData.showPassword,
              }))
            }
            icon={
              data.showPassword ? (
                <FillEyeInvisible width="20px" height="20px" fill="white" />
              ) : (
                <FillEyeVisible width="20px" height="20px" fill="white" />
              )
            }
          />
        </InputRightElement>
      </InputGroup>
      <Button
        isLoading={load.submitLoad}
        loadingText="Submitting"
        colorScheme="teal"
        variant="outline"
        type="submit"
        size="lg"
        w={'100%'}
        mt={4}
      >
        {t('submit_button')}
      </Button>
      <Flex
        justifyContent="space-between"
        mt={4}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Button
          variant="solid"
          colorScheme="green"
          onClick={() => {
            onClose()
            dispatchRedux(setIsRegisterOpen(true))
          }}
        >
          {t('create_account_button')}
        </Button>
        <Button
          isLoading={load.forgotLoad}
          variant="solid"
          colorScheme="red"
          onClick={handleForgotPasswordThrottled}
        >
          {t('forgot_password_button')}
        </Button>
      </Flex>
    </form>
  )
}

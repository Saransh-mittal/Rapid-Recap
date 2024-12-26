import React from 'react'
import { InputGroup, Input, Button } from '@chakra-ui/react'

export default function InGameNameForm({
  inGameName,
  inGameNameHandler,
  handleInGameNameSubmit,
  load,
  t,
}) {
  return (
    <>
      <InputGroup mt={4}>
        <Input
          onChange={inGameNameHandler}
          name="inGameName"
          value={inGameName}
          type="text"
          placeholder={t('enter_in_game_name')}
          color="white"
        />
      </InputGroup>
      <Button
        isLoading={load.submitLoad}
        loadingText="Submitting"
        colorScheme="teal"
        variant="outline"
        onClick={handleInGameNameSubmit}
        size="lg"
        w={'100%'}
        mt={4}
      >
        {t('submit_button')}
      </Button>
    </>
  )
}

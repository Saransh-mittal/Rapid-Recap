import { Box } from '@chakra-ui/react'
import React, { Suspense, useMemo, useCallback } from 'react'
import './styles.css'

// Lazily load the SingleChat component
const SingleChat = React.lazy(() => import('./miniComponents/SingleChat'))

const UserChatBox = ({ selectedChat, fetchAgain, setFetchAgain }) => {
  // Memoize the computed style to avoid recalculating it on every render
  const boxStyle = useMemo(
    () => ({
      backgroundImage:
        'linear-gradient(-180deg, rgba(32, 28, 46, 0.7), rgba(19, 16, 29, 0.7) 88%, rgba(19, 16, 29, 0.7) 99%)',
      boxShadow:
        'inset 0 0 10px rgba(255, 255, 255, 0.05), 0 4px 10px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.2)',
    }),
    [],
  )

  // UseCallback to memoize the setFetchAgain function if it’s expected to be passed down unchanged
  const handleSetFetchAgain = useCallback(
    value => {
      setFetchAgain(value)
    },
    [setFetchAgain, fetchAgain],
  )

  return (
    <Box
      display={{ base: selectedChat ? 'flex' : 'none', md: 'flex' }}
      alignItems="center"
      flexDirection="column"
      p={3}
      w={{ base: '100%', md: '95%' }}
      borderRadius="lg"
      style={boxStyle}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <SingleChat
          fetchAgain={fetchAgain}
          setFetchAgain={handleSetFetchAgain}
        />
      </Suspense>
    </Box>
  )
}

export default React.memo(UserChatBox)

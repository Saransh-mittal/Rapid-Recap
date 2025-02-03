import React from 'react'
import { Button, VStack, Box, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import GetStarted from '../Header-Footer/modernNavbarComponents/GetStarted'

const MotionBox = motion(Box)

const FloatingActionButtons = ({
  showClearSearch,
  showLoadMore,
  onClearSearch,
  onLoadMore,
  t, // translation function
  notLoggedIn,
  showGetsStarted,
}) => {
  return (
    <MotionBox
      position="fixed"
      bottom="3rem"
      right="0.5rem"
      zIndex={1000}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <VStack spacing={4} align="stretch">
        {notLoggedIn && showGetsStarted && (
          <Flex
            marginTop="2rem"
            height="6rem"
            width="100%"
            color="white"
            justifyContent="center"
            alignItems="center"
            borderRadius="8px"
            padding="1rem"
            textAlign="center"
          >
            <GetStarted innerText={t('messages.loginToContinue')} />
          </Flex>
        )}
        {showLoadMore && !notLoggedIn && (
          <Button
            colorScheme="blue"
            size="lg"
            borderRadius="full"
            boxShadow="lg"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
            onClick={onLoadMore}
          >
            {t('buttons.loadMore')}
          </Button>
        )}
        {showClearSearch && !notLoggedIn && (
          <Button
            colorScheme="red"
            size="lg"
            borderRadius="full"
            boxShadow="lg"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
            onClick={onClearSearch}
          >
            {t('buttons.clearSearch')}
          </Button>
        )}
      </VStack>
    </MotionBox>
  )
}

export default React.memo(FloatingActionButtons)

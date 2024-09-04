import { useTranslation } from 'react-i18next'
import axios from 'axios'
import i18n from 'i18next'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Text, Select, Skeleton } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const MotionBox = motion(Box)
const MotionSelect = motion(Select)

const LanguageSwitcher = () => {
  const { t } = useTranslation('Settings')
  const { user } = useSelector(state => state.auth)
  const [currentLanguage, setCurrentLanguage] = useState(user.userLanguage)
  const [loading, setLoading] = useState(false) // State to manage loading

  const changeLanguage = async lng => {
    setLoading(true) // Start loading
    await i18n.changeLanguage(lng)
    setCurrentLanguage(lng) // Update the local state

    // Send request to the server to update user language
    await axios.post('/api/user/language', { language: lng })

    setLoading(false) // End loading
  }

  useEffect(() => {
    // Sync the local state with the Redux store or i18next's language
    setCurrentLanguage(user.userLanguage)
  }, [user.userLanguage])

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="whiteAlpha.100"
        p={4}
        borderRadius="md"
        _hover={{ bg: 'whiteAlpha.200' }}
        transition="background 0.2s"
      >
        <Skeleton isLoaded={!loading} width="100%">
          <Text color="white" fontWeight="medium" fontSize={'lg'}>
            {t('selectLanguage')}
          </Text>
        </Skeleton>
        <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Skeleton isLoaded={!loading}>
            <MotionSelect
              value={currentLanguage}
              onChange={e => changeLanguage(e.target.value)}
              bg="whiteAlpha.200"
              color="white"
              borderColor="whiteAlpha.400"
              _hover={{ borderColor: 'whiteAlpha.600' }}
              transition={{ duration: 0.3 }}
            >
              <option
                style={{
                  backgroundColor: 'black',
                  color: 'white',
                }}
                value="en"
              >
                English
              </option>
              <option
                style={{
                  backgroundColor: 'black',
                  color: 'white',
                }}
                value="hi"
              >
                हिन्दी
              </option>
            </MotionSelect>
          </Skeleton>
        </MotionBox>
      </Box>
    </MotionBox>
  )
}

export default LanguageSwitcher

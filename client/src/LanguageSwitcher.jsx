import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Box, Text, Select, Skeleton } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { changeLanguage } from './utils/helper.utils'
import i18n from 'i18next'

const MotionBox = motion(Box)
const MotionSelect = motion(Select)

const LanguageSwitcher = () => {
  const { t } = useTranslation('Settings')
  const { user } = useSelector(state => state.auth)
  const [currentLanguage, setCurrentLanguage] = useState(user?.userLanguage)
  const [loading, setLoading] = useState(false) // State to manage loading

  useEffect(() => {
    // Sync the local state with the Redux store or i18next's language
    setCurrentLanguage(i18n.language)
  }, [i18n.language])

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
              onChange={e =>
                changeLanguage(e.target.value, setLoading, setCurrentLanguage)
              }
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

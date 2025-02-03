import React from 'react'
import {
  Box,
  Button,
  useBreakpointValue,
  Portal,
  SlideFade,
  Link,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import useSafeSound from '../../customHooks/useSafeSound'
import { useFeatureDetection } from '../../utils/featureDetection'
import { setIsSigninOpen } from '../../redux/appSlice'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

const SmartCTA = ({ isMainButtonVisible, COLORS }) => {
  const { t } = useTranslation('GetStarted')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const features = useFeatureDetection()

  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const dispatch = useDispatch()

  return (
    <AnimatePresence>
      <Portal>
        <SlideFade in={isMainButtonVisible} offsetY="20px">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <Box
              position="fixed"
              bottom={4}
              right={4}
              zIndex={1000}
              bg="rgba(28, 25, 63, 0.95)"
              borderRadius="xl"
              p={2}
              backdropFilter="blur(8px)"
              border="1px solid"
              borderColor="rgba(237, 100, 166, 0.2)"
              boxShadow="lg"
            >
              <Link
                href="/#signin"
                onClick={() => {
                  playClick()
                  dispatch(setIsSigninOpen(true))
                }}
              >
                <Button
                  size={{ base: 'md', md: 'lg' }}
                  bg={COLORS.accent}
                  color="white"
                  px={8}
                  py={6}
                  fontSize={isMobile ? 'md' : 'xl'}
                  rightIcon={<TrendingUp />}
                  _hover={{
                    bg: 'pink.500',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: `0 0 20px ${COLORS.accent}33`,
                  }}
                  transition="all 0.3s ease"
                >
                  {t('Header.getStartedButton')}
                </Button>
              </Link>
            </Box>
          </motion.div>
        </SlideFade>
      </Portal>
    </AnimatePresence>
  )
}

export default SmartCTA

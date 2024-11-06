import { Flex, Image } from '@chakra-ui/react'
import React, { Suspense } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
// import useSound from '../../../customHooks/useSound'
import { useTranslation } from 'react-i18next'
import { useFeatureDetection } from '../../../utils/featureDetection'
import useSafeSound from '../../../customHooks/useSafeSound'

const RR = '/images/rrlogo.webp'

// Lazy load Heading component
const Heading = React.lazy(() => import('../../miscellaneous/HeadingComponent'))

const NavBrand = ({ isHamburgerOpen }) => {
  const { t } = useTranslation('NavBrand')
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const { isAuthenticated } = useSelector(state => state.auth)

  const notLoggedIn = !isAuthenticated

  return (
    <NavLink to={'/'} className="navbar-brand" onClick={playClick}>
      <Flex position={!isHamburgerOpen ? 'absolute' : 'relative'}>
        <Image
          src={RR}
          alt="Rapid Recap"
          width="2.5rem"
          height="2.5rem"
          background="transparent"
          marginRight="-5px"
          transform="rotate(-0.5deg)"
        />
        <Flex
          ml={3}
          display={{
            base: isHamburgerOpen || !isAuthenticated ? 'flex' : 'none',
            md: 'block',
          }}
          color="white"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Heading title={t('rr')} marginBottom="0" />
          </Suspense>
        </Flex>
      </Flex>
    </NavLink>
  )
}

export default NavBrand

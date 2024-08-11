import { Flex, Image } from '@chakra-ui/react'
import React, { Suspense } from 'react'
import { NavLink } from 'react-router-dom'
import RR from '/images/rrlogo.webp'
import { useSelector } from 'react-redux'
import useSound from '../../../customHooks/useSound'

// Lazy load Heading component
const Heading = React.lazy(() => import('../../miscellaneous/HeadingComponent'))

const NavBrand = ({ isHamburgerOpen }) => {
  const { playClick } = useSound()
  const { isAuthenticated } = useSelector(state => state.auth)

  const notLoggedIn = !isAuthenticated

  return (
    <NavLink
      to={notLoggedIn ? '/' : '/get-started'}
      className="navbar-brand"
      onClick={playClick}
    >
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
          display={{ base: isHamburgerOpen ? 'flex' : 'none', md: 'block' }}
          color="white"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Heading title="Rapid Recap" marginBottom="0" />
          </Suspense>
        </Flex>
      </Flex>
    </NavLink>
  )
}

export default NavBrand

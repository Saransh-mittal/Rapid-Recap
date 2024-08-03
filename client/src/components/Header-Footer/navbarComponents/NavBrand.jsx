import { Flex, Image } from '@chakra-ui/react'
import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import RR from '/images/rrlogo.webp'
import Heading from '../../miscellaneous/HeadingComponent'
import { AppContext } from '../../../contextAPI/appContext'
import { useSelector } from 'react-redux'

const NavBrand = ({ isHamburgerOpen }) => {
  const { playClick } = useContext(AppContext)
  const { isAuthenticated } = useSelector(state => state.auth)

  const notLoggedIn = !isAuthenticated

  return (
    <NavLink
      to={notLoggedIn ? '/' : '/get-started'}
      className={`navbar-brand`}
      onClick={playClick}
    >
      <Flex position={!isHamburgerOpen ? 'absolute' : 'relative'}>
        <Image
          src={RR}
          alt="Rapid Recap"
          width={'2.5rem'}
          height={'2.5rem'}
          background={'transparent'}
          marginRight={'-5px'}
          // rotate to left by 2 degrees
          transform={'rotate(-0.5deg)'}
        />
        {/* <Image
          src={Logo}
          alt="Rapid Recap"
          width={{
            base: isHamburgerOpen ? "5rem" : "4.8rem",
            md: "6rem",
          }}
          height={"2.5rem"}
          background={"transparent"}
        /> */}
        {/* <Heading>Rapid Recap</Heading> */}
        <Flex
          ml={3}
          display={{ base: isHamburgerOpen ? 'flex' : 'none', md: 'block' }}
          color={'white'}
        >
          <Heading title={'Rapid Recap'} marginBottom="0" />
        </Flex>
      </Flex>
    </NavLink>
  )
}

export default NavBrand

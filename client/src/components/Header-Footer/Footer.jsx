import React, { lazy, Suspense } from 'react'
import { Box, Flex, Link, Text } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'

// Lazy loading the SVG components
const InstagramSVG = lazy(() => import('../../assets/svg/InstagramSVG'))
const LinkedinSVG = lazy(() => import('../../assets/svg/LinkedinSVG'))

const Footer = React.memo(({ onCloseMenu }) => {
  return (
    <Box as="footer" pt={3}>
      <Flex
        as="ul"
        justify="center"
        borderBottom="1px solid"
        borderColor="gray.600"
        pb={3}
        mb={3}
      >
        <Box mr={4}>
          <Link
            href="https://www.instagram.com/rrapidrecap/"
            target="_blank"
            color="#f9f9f9"
            aria-label="Follow us on Instagram"
            title="Follow us on Instagram"
          >
            <Suspense fallback={<div>Loading...</div>}>
              <InstagramSVG width="25px" height="25px" fill="#fff" />
            </Suspense>
          </Link>
        </Box>
        <Box mr={4}>
          <Link
            href="https://www.linkedin.com/company/rrapidrecap/"
            target="_blank"
            color="#f9f9f9"
            aria-label="Follow us on LinkedIn"
            title="Follow us on LinkedIn"
          >
            <Suspense fallback={<div>Loading...</div>}>
              <LinkedinSVG width="25px" height="25px" fill="#fff" />
            </Suspense>
          </Link>
        </Box>
        <Box color={'#f9f9f9'} onClick={onCloseMenu}>
          <NavLink
            to="/contact"
            color="#f9f9f9"
            aria-label="Contact Us"
            title="Contact Us"
          >
            Contact Us
          </NavLink>
        </Box>
      </Flex>
      <Text textAlign="center" color="#f9f9f9">
        2024, All rights reserved
      </Text>
    </Box>
  )
})

export default Footer

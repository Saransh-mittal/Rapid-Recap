import React from 'react'
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
  VStack,
  Icon,
  useColorModeValue,
  Divider,
  chakra,
} from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa'

const SocialLink = chakra(Link, {
  baseStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    rounded: 'full',
    transition: 'all 0.3s ease',
    w: '40px',
    h: '40px',
    _hover: {
      transform: 'translateY(-2px)',
    },
  },
})

const Footer = React.memo(({ onCloseMenu }) => {
  const currentYear = new Date().getFullYear()
  const bgGradient = useColorModeValue(
    'linear(to-r, gray.900, purple.900, gray.900)',
    'linear(to-r, gray.900, purple.900, gray.900)',
  )
  const borderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.300')
  const textColor = useColorModeValue('whiteAlpha.900', 'whiteAlpha.900')
  const subTextColor = useColorModeValue('whiteAlpha.700', 'whiteAlpha.700')
  const hoverColor = useColorModeValue('purple.400', 'purple.400')

  return (
    <Box
      as="footer"
      bgGradient={bgGradient}
      color={textColor}
      borderTop="1px solid"
      borderColor={borderColor}
      py={12}
      position="relative"
      overflow="hidden"
    >
      {/* Elegant background overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at top right, whiteAlpha.100 0%, transparent 70%)"
      />

      <Container maxW="7xl" position="relative">
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={8}
          mb={12}
        >
          {/* Brand Section */}
          <VStack align="flex-start" spacing={4}>
            <Heading
              size="lg"
              bgGradient="linear(to-r, purple.400, pink.400)"
              bgClip="text"
              fontWeight="bold"
            >
              RapidRecap
            </Heading>
            <Text color={subTextColor} fontSize="md" maxW="sm">
              Transforming the way you stay informed. Delivering concise,
              impactful insights for the modern professional.
            </Text>
          </VStack>

          {/* Quick Links */}
          <VStack align="flex-start" spacing={4}>
            <Heading size="sm" textTransform="uppercase" letterSpacing="wider">
              Quick Links
            </Heading>
            <VStack align="flex-start" spacing={2}>
              {[
                { text: 'About Us', path: '/about' },
                { text: 'Our Services', path: '/services' },
                { text: 'Contact', path: '/contact' },
                { text: 'Privacy Policy', path: '/privacy' },
              ].map(link => (
                <Link
                  key={link.text}
                  as={NavLink}
                  to={link.path}
                  color={subTextColor}
                  _hover={{ color: hoverColor, textDecoration: 'none' }}
                  onClick={onCloseMenu}
                  fontSize="sm"
                >
                  {link.text}
                </Link>
              ))}
            </VStack>
          </VStack>

          {/* Social Links */}
          <VStack align={{ base: 'flex-start', md: 'flex-end' }} spacing={4}>
            <Heading size="sm" textTransform="uppercase" letterSpacing="wider">
              Connect With Us
            </Heading>
            <Flex gap={4}>
              <SocialLink
                href="https://www.instagram.com/rrapidrecap/"
                target="_blank"
                rel="noopener noreferrer"
                bg="whiteAlpha.100"
                _hover={{ bg: 'purple.500' }}
                aria-label="Instagram"
              >
                <Icon as={FaInstagram} boxSize={5} />
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/company/rrapidrecap/"
                target="_blank"
                rel="noopener noreferrer"
                bg="whiteAlpha.100"
                _hover={{ bg: 'purple.500' }}
                aria-label="LinkedIn"
              >
                <Icon as={FaLinkedin} boxSize={5} />
              </SocialLink>
              <SocialLink
                as={NavLink}
                to="/contact"
                bg="whiteAlpha.100"
                _hover={{ bg: 'purple.500' }}
                onClick={onCloseMenu}
                aria-label="Contact Us"
              >
                <Icon as={FaEnvelope} boxSize={5} />
              </SocialLink>
            </Flex>
          </VStack>
        </Grid>

        <Divider borderColor={borderColor} opacity={0.3} />

        {/* Copyright Section */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          mt={8}
          fontSize="sm"
          color={subTextColor}
          textAlign="center"
        >
          <Text>© {currentYear} RapidRecap. All rights reserved.</Text>
          <Flex gap={6} mt={{ base: 4, md: 0 }}>
            <Link _hover={{ color: hoverColor }}>Terms of Service</Link>
            <Link _hover={{ color: hoverColor }}>Cookie Policy</Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
})

export default Footer

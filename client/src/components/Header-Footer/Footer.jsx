import React from 'react'
import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  Icon,
  Text,
  useColorModeValue,
  chakra,
  Divider,
} from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { FaInstagram, FaLinkedin } from 'react-icons/fa'

const SocialLink = chakra(Link, {
  baseStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    rounded: 'full',
    transition: 'all 0.3s ease',
    w: '36px',
    h: '36px',
    backdropFilter: 'blur(8px)',
    _hover: {
      transform: 'translateY(-2px)',
      bg: 'rgba(255, 255, 255, 0.15)',
    },
  },
})

const Footer = React.memo(({ onCloseMenu }) => {
  const bgGradient = useColorModeValue(
    'linear(to-r, purple.900, gray.900)',
    'linear(to-r, purple.900, gray.900)',
  )
  const borderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.300')
  const textColor = useColorModeValue('whiteAlpha.900', 'whiteAlpha.900')
  const subTextColor = useColorModeValue('whiteAlpha.700', 'whiteAlpha.700')
  const glowColor = useColorModeValue('purple.400', 'purple.400')

  return (
    <Box
      as="footer"
      bg="gray.900"
      color={textColor}
      borderTop="1px solid"
      borderColor={borderColor}
      py={6}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: bgGradient,
        opacity: 0.8,
      }}
    >
      {/* Glassmorphism overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at top right, whiteAlpha.100 0%, transparent 70%)"
        backdropFilter="blur(20px)"
      />

      <Container maxW="7xl" position="relative">
        <Flex direction="column" gap={4} px={4}>
          {/* Top Row with Logo and Social Icons */}
          <Flex align="center" gap={8}>
            {/* Brand Section */}
            <Heading
              size="md"
              bgGradient="linear(to-r, purple.400, pink.400)"
              bgClip="text"
              fontWeight="bold"
              letterSpacing="wide"
              textShadow={`0 0 20px ${glowColor}`}
            >
              RapidRecap
            </Heading>

            {/* Vertical Divider */}
            <Box h="24px" w="1px" bg="whiteAlpha.300" mx={2} />

            {/* Social Links */}
            <Flex gap={4} align="center">
              <SocialLink
                href="https://www.instagram.com/rrapidrecap/"
                target="_blank"
                rel="noopener noreferrer"
                bg="whiteAlpha.100"
                aria-label="Instagram"
              >
                <Icon as={FaInstagram} boxSize={4} />
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/company/rrapidrecap/"
                target="_blank"
                rel="noopener noreferrer"
                bg="whiteAlpha.100"
                aria-label="LinkedIn"
              >
                <Icon as={FaLinkedin} boxSize={4} />
              </SocialLink>
              <Link
                as={NavLink}
                to="/contact"
                color={subTextColor}
                fontSize="sm"
                fontWeight="medium"
                transition="all 0.3s ease"
                _hover={{
                  color: 'purple.400',
                  textDecoration: 'none',
                  textShadow: '0 0 8px rgba(168, 85, 247, 0.4)',
                }}
                onClick={onCloseMenu}
                ml={2}
              >
                Contact Us
              </Link>
            </Flex>
          </Flex>

          {/* Subtle Divider */}
          <Divider borderColor="whiteAlpha.200" />

          {/* Bottom Row with Reserved Text */}
          <Text
            color={subTextColor}
            fontSize="xs"
            fontWeight="medium"
            letterSpacing="wider"
          >
            2024, All rights reserved
          </Text>
        </Flex>
      </Container>
    </Box>
  )
})

export default Footer

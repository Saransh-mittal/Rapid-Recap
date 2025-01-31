import React from 'react'
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Icon,
  Text,
  useColorModeValue,
  chakra,
  Divider,
  Stack,
  VStack,
} from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { FaInstagram, FaLinkedin, FaRocket } from 'react-icons/fa'
import { motion } from 'framer-motion'

const MotionLink = motion(Link)
const SocialLink = chakra(Link, {
  baseStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    rounded: 'full',
    transition: 'all 0.3s ease',
    w: { base: '36px', sm: '40px' },
    h: { base: '36px', sm: '40px' },
    backdropFilter: 'blur(8px)',
    _hover: {
      transform: 'translateY(-2px)',
      bg: 'rgba(255, 255, 255, 0.15)',
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
    },
  },
})

const Footer = React.memo(({ onCloseMenu, refFooter }) => {
  const bgGradient = useColorModeValue(
    'linear(to-r, purple.900, gray.900)',
    'linear(to-r, purple.900, gray.900)',
  )
  const borderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.300')
  const textColor = useColorModeValue('whiteAlpha.900', 'whiteAlpha.900')
  const subTextColor = useColorModeValue('whiteAlpha.700', 'whiteAlpha.700')
  const glowColor = useColorModeValue('purple.400', 'purple.400')

  const footerNavItems = [
    { label: 'Home', path: '/home' },
    { label: 'Tournament', path: '/tournament' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Champions', path: '/hall-of-champions' },
  ]

  return (
    <Box
      ref={refFooter}
      as="footer"
      bg="gray.900"
      w="100%"
      color={textColor}
      borderTop="1px solid"
      borderColor={borderColor}
      py={{ base: 4, sm: 6 }}
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
      {/* Celestial Background Effects */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at top right, purple.900 0%, transparent 70%)"
        backdropFilter="blur(40px)"
        opacity={0.3}
      />

      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at bottom left, blue.900 0%, transparent 70%)"
        opacity={0.2}
      />

      <Container maxW="7xl" position="relative">
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={{ base: 10, md: 16 }}
          mb={6}
        >
          {/* Brand Section */}
          <GridItem colSpan={{ base: 1, md: 1 }}>
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Flex align="center">
                <Icon
                  as={FaRocket}
                  boxSize={{ base: 7, md: 8 }}
                  color="purple.400"
                  mr={3}
                  transform="rotate(-45deg)"
                  filter="drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))"
                />
                <Heading
                  size={{ base: 'lg', md: 'xl' }}
                  bgGradient="linear(to-r, purple.400, pink.400)"
                  bgClip="text"
                  letterSpacing="wide"
                  textShadow={`0 0 20px ${glowColor}`}
                >
                  Rapid Recap
                </Heading>
              </Flex>
              <Text
                color={subTextColor}
                textAlign={{ base: 'center', md: 'left' }}
                fontSize={{ base: 'sm', md: 'md' }}
                maxW="sm"
              >
                Transform your news consumption into knowledge mastery through
                AI-powered insights and competitive learning.
              </Text>
            </VStack>
          </GridItem>

          {/* Navigation */}
          <GridItem colSpan={1}>
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Text
                fontWeight="600"
                fontSize={{ base: 'lg', md: 'xl' }}
                bgGradient="linear(to-r, purple.400, pink.400)"
                bgClip="text"
              >
                Explore
              </Text>
              <Flex
                gap={4}
                wrap="wrap"
                justify={{ base: 'center', md: 'flex-start' }}
                align="center"
              >
                {footerNavItems.map(item => (
                  <MotionLink
                    key={item.path}
                    as={NavLink}
                    to={item.path}
                    color={subTextColor}
                    onClick={onCloseMenu}
                    whileHover={{
                      x: 5,
                      color: 'purple.400',
                      textShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                    }}
                    _hover={{
                      color: 'purple.400',
                      textDecoration: 'none',
                      textShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                    }}
                    fontSize={{ base: 'sm', md: 'md' }}
                    px={3}
                    py={2}
                    borderRadius="full"
                    transition="all 0.3s ease"
                    bg="whiteAlpha.50"
                    backdropFilter="blur(8px)"
                  >
                    {item.label}
                  </MotionLink>
                ))}
              </Flex>
            </VStack>
          </GridItem>

          {/* Connect Section */}
          <GridItem colSpan={1}>
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Text
                fontWeight="600"
                fontSize={{ base: 'lg', md: 'xl' }}
                bgGradient="linear(to-r, purple.400, pink.400)"
                bgClip="text"
              >
                Connect With Us
              </Text>
              <Stack spacing={4} align={{ base: 'center', md: 'flex-start' }}>
                <Flex gap={4}>
                  <SocialLink
                    href="https://instagram.com"
                    target="_blank"
                    bg="whiteAlpha.100"
                    aria-label="Instagram"
                  >
                    <Icon
                      as={FaInstagram}
                      boxSize={{ base: 5, sm: 6 }}
                      color="purple.400"
                    />
                  </SocialLink>
                  <SocialLink
                    href="https://linkedin.com"
                    target="_blank"
                    bg="whiteAlpha.100"
                    aria-label="LinkedIn"
                  >
                    <Icon
                      as={FaLinkedin}
                      boxSize={{ base: 5, sm: 6 }}
                      color="purple.400"
                    />
                  </SocialLink>
                </Flex>
                <Link
                  as={NavLink}
                  to="/contact"
                  color={subTextColor}
                  _hover={{
                    color: 'purple.400',
                    textShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                  }}
                  onClick={onCloseMenu}
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  Contact Support
                </Link>
              </Stack>
            </VStack>
          </GridItem>
        </Grid>

        {/* Majestic Divider */}
        <Box position="relative" my={4}>
          <Divider
            borderColor="whiteAlpha.200"
            opacity={0.3}
            css={{
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)',
              background:
                'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.2), transparent)',
            }}
          />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width="100px"
            height="2px"
            bgGradient="linear(to-r, transparent, purple.400, transparent)"
            filter="blur(1px)"
          />
        </Box>

        {/* Copyright + Legal */}
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align="center"
          color={subTextColor}
          fontSize={{ base: 'xs', sm: 'sm' }}
          textAlign="center"
          gap={4}
        >
          <Text>© 2024 Rapid Recap. Cosmic Knowledge, Earthly Access</Text>
          <Flex gap={4} justify={{ base: 'center', sm: 'flex-end' }}>
            <Link
              as={NavLink}
              to="/privacy-policy"
              _hover={{
                color: 'purple.400',
                textShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
              }}
            >
              Privacy Policy
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
})

export default Footer

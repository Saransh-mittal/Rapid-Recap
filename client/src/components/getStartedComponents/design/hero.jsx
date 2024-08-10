import { useEffect, useState } from 'react'
import { MouseParallax } from 'react-just-parallax'
import { Box, Flex, Image } from '@chakra-ui/react'
import PlusSvg from '../../../assets/svg/PlusSvg'
import gradient from '../../../assets/gradient.webp'

export const Gradient = () => {
  return (
    <>
      <Box
        position="relative"
        zIndex={1}
        h={6}
        mx={2.5}
        bg="white"
        shadow="xl"
        roundedBottom="1.25rem"
        lg={{ h: 6, mx: 8 }}
      />
      <Box
        position="relative"
        zIndex={1}
        h={6}
        mx={6}
        bg="rgba(0, 0, 0, 0.7)"
        shadow="xl"
        roundedBottom="1.25rem"
        lg={{ h: 6, mx: 20 }}
      />
    </>
  )
}

export const MediumScreenbgGradient = ({ top, left, width }) => {
  return (
    <Box
      position="absolute"
      //   top="18.25rem"
      //   left="-30.375rem"
      top={top}
      left={left}
      //   width="56.625rem"
      width={width}
      opacity="0.6"
      mixBlendMode="color-dodge"
      pointerEvents="none"
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width="58.85rem"
        height="58.85rem"
        transform="translate(-75%, -50%)"
      >
        <Image
          src={gradient}
          width="942px"
          height="942px"
          alt="Gradient"
          bg={'transparent'}
        />
      </Box>
    </Box>
  )
}

export const BottomLine = ({ lineTop, plusTop, persistOnEveryVP }) => {
  return (
    <>
      <Box
        display={persistOnEveryVP ? 'block' : { xl: 'block', base: 'none' }}
        position="absolute"
        top={lineTop ? lineTop : '55.25rem'}
        left={10}
        right={10}
        h="1px"
        bg="gray.600"
        pointerEvents="none"
        zIndex={1}
      />
      <Box
        display={persistOnEveryVP ? 'block' : { xl: 'block', base: 'none' }}
        position="absolute"
        top={plusTop ? plusTop : '54.9375rem'}
        left="2.1875rem"
        zIndex={2}
        pointerEvents="none"
      >
        <PlusSvg />
      </Box>
      <Box
        display={persistOnEveryVP ? 'block' : { xl: 'block', base: 'none' }}
        position="absolute"
        top={plusTop ? plusTop : '54.9375rem'}
        right="2.1875rem"
        zIndex={2}
        pointerEvents="none"
      >
        <PlusSvg />
      </Box>
    </>
  )
}

const Rings = () => {
  return (
    <>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        w="44rem"
        aspectRatio="1"
        border="1px"
        borderColor="rgba(255, 255, 255, 0.1)"
        rounded="full"
        transform="translate(-50%, -50%)"
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        w="33rem"
        aspectRatio="1"
        border="1px"
        borderColor="rgba(255, 255, 255, 0.1)"
        rounded="full"
        transform="translate(-50%, -50%)"
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        w="22rem"
        aspectRatio="1"
        border="1px"
        borderColor="rgba(255, 255, 255, 0.1)"
        rounded="full"
        transform="translate(-50%, -50%)"
      />
      <Box
        position="absolute"
        top={'50%'}
        left="50%"
        w="11rem"
        aspectRatio="1"
        border="1px"
        borderColor="rgba(255, 255, 255, 0.1)"
        rounded="full"
        transform="translate(-50%, -50%)"
      />
    </>
  )
}

export const BackgroundCircles = ({ parallaxRef, bTop, bLeft }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Box
      position="absolute"
      // top={{ base: "70%", md: "60%", xl: "50%" }}
      display={{ base: 'none', md: 'block' }}
      top={bTop ? bTop : { base: '-50%', md: '-50%', lg: '-100%', xl: '-110%' }}
      left={bLeft ? bLeft : '50%'}
      w="55rem"
      aspectRatio="1"
      border="1px"
      borderColor="rgba(255, 255, 255, 0.1)"
      rounded="full"
      transform="translateX(-50%) translateY(13%)"
    >
      <Rings />

      <MouseParallax strength={0.07} parallaxContainerRef={parallaxRef}>
        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(46deg)"
        >
          <Box
            w="2"
            h="2"
            ml="-1"
            mt="-36"
            bgGradient="linear(to-b, #DD734F, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? 'translateY(0)' : 'translateY(10)'}
            opacity={mounted ? '1' : '0'}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(-56deg)"
        >
          <Box
            w="4"
            h="4"
            ml="-1"
            mt="-32"
            bgGradient="linear(to-b, #DD734F, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? 'translateY(0)' : 'translateY(10)'}
            opacity={mounted ? '1' : '0'}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(54deg)"
        >
          <Box
            display={{ xl: 'block', base: 'none' }}
            w="4"
            h="4"
            ml="-1"
            mt="12.9rem"
            bgGradient="linear(to-b, #B9AEDF, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? 'translateY(0)' : 'translateY(10)'}
            opacity={mounted ? '1' : '0'}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(-65deg)"
        >
          <Box
            w="3"
            h="3"
            ml="-1.5"
            mt="52"
            bgGradient="linear(to-b, #B9AEDF, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? 'translateY(0)' : 'translateY(10)'}
            opacity={mounted ? '1' : '0'}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(-85deg)"
        >
          <Box
            w="6"
            h="6"
            ml="-3"
            mt="-3"
            bgGradient="linear(to-b, #88E5BE, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? 'translateY(0)' : 'translateY(10)'}
            opacity={mounted ? '1' : '0'}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(70deg)"
        >
          <Box
            w="6"
            h="6"
            ml="-3"
            mt="-3"
            bgGradient="linear(to-b, #88E5BE, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? 'translateY(0)' : 'translateY(10)'}
            opacity={mounted ? '1' : '0'}
          />
        </Box>
      </MouseParallax>
    </Box>
  )
}

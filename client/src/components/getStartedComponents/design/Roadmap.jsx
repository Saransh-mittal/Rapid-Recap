import React, { useMemo } from 'react'
import { Image, Box } from '@chakra-ui/react'
import gradient from '../../../assets/gradient.webp'
import PlusSvg from '../../../assets/svg/PlusSvg'

const GradientImage = React.memo(() => (
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
      width={942}
      height={942}
      alt="Gradient"
      bg="transparent"
    />
  </Box>
))

export const Gradient = React.memo(({ top, left, width }) => {
  const boxStyle = useMemo(
    () => ({
      position: 'absolute',
      top,
      left,
      width,
      opacity: 0.6,
      mixBlendMode: 'color-dodge',
      pointerEvents: 'none',
    }),
    [top, left, width],
  )

  return (
    <Box {...boxStyle}>
      <GradientImage />
    </Box>
  )
})

const PlusIcon = React.memo(({ position, ...props }) => (
  <Box
    display={{ base: 'none', md: 'block' }}
    as={PlusSvg}
    className="pointer-events-none"
    position="absolute"
    bottom="-0.3rem"
    {...position}
    {...props}
  />
))

export const BottomLine = React.memo(() => {
  const lineStyle = useMemo(
    () => ({
      display: { base: 'none', md: 'block' },
      position: 'absolute',
      bottom: 0,
      left: { base: '5', lg: '7', xl: '10' },
      right: { base: '5', lg: '7', xl: '10' },
      h: '1px',
      bg: 'gray.600',
      pointerEvents: 'none',
    }),
    [],
  )

  return (
    <>
      <Box {...lineStyle} />
      <PlusIcon position={{ left: { base: '4', lg: '6', xl: '9' } }} />
      <PlusIcon position={{ right: { base: '4', lg: '6', xl: '9' } }} />
    </>
  )
})

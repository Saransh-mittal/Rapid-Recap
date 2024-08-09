import { Box } from '@chakra-ui/react'

export const Rings = () => {
  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      width="51.375rem"
      height="51.375rem"
      border="1px"
      borderColor="rgba(255, 255, 255, 0.1)" // Very light color for a classy and faded look
      borderRadius="full"
      transform="translate(-50%, -50%)"
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width="36.125rem"
        height="36.125rem"
        border="1px"
        borderColor="rgba(255, 255, 255, 0.1)" // Very light color for a classy and faded look
        borderRadius="full"
        transform="translate(-50%, -50%)"
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width="23.125rem"
        height="23.125rem"
        border="1px"
        borderColor="rgba(255, 255, 255, 0.1)" // Very light color for a classy and faded look
        borderRadius="full"
        transform="translate(-50%, -50%)"
      />
    </Box>
  )
}

export const SideLines = () => {
  return (
    <>
      <Box
        position="absolute"
        top="0"
        left="5"
        width="1px"
        height="100%"
        bg="gray.600" // assuming bg-n-6 is a shade of gray
      />
      <Box
        position="absolute"
        top="0"
        right="5"
        width="1px"
        height="100%"
        bg="gray.600" // assuming bg-n-6 is a shade of gray
      />
    </>
  )
}

export const BackgroundCircles = () => {
  return (
    <>
      <Box
        position="absolute"
        top="6rem"
        left="4rem"
        width="0.75rem"
        height="0.75rem"
        bgGradient="linear(to-b, #DD734F, #1A1A32)"
        borderRadius="full"
      />
      <Box
        position="absolute"
        top="12.6rem"
        right="4rem"
        width="0.75rem"
        height="0.75rem"
        bgGradient="linear(to-b, #B9AEDF, #1A1A32)"
        borderRadius="full"
      />
      <Box
        position="absolute"
        top="26.8rem"
        left="3rem"
        width="1.5rem"
        height="1.5rem"
        bgGradient="linear(to-b, #88E5BE, #1A1A32)"
        borderRadius="full"
      />
    </>
  )
}
